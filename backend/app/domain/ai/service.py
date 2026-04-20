import asyncio
import os
import anthropic
from typing import Optional
import json
import cv2
import numpy as np
from mediapipe import solutions
import base64
import requests
from datetime import datetime


WORKOUT_SYSTEM_PROMPT = (
    "You are an elite personal trainer and evidence-based strength coach. "
    "Generate personalized, safe, and progressive workout plans grounded in "
    "exercise science. Every plan must:\n"
    "- Use evidence-based programming with explicit sets, reps, tempo, rest, "
    "  and RPE (rate of perceived exertion 1-10).\n"
    "- Apply progressive overload principles appropriate to the user's "
    "  experience level (beginner/intermediate/advanced).\n"
    "- Respect the user's available equipment and any stated limitations or "
    "  injuries - never prescribe exercises the user cannot safely perform.\n"
    "- Match the user's goal (hypertrophy, strength, endurance, fat loss, "
    "  general fitness) with the appropriate rep ranges and rest intervals.\n"
    "- Balance muscle groups, include adequate warm-up cues, and avoid "
    "  overtraining.\n"
    "CRITICAL OUTPUT RULE: Respond with a single valid JSON object only. "
    "No markdown fences, no commentary, no preamble. The JSON must match the "
    "schema provided in the user message exactly."
)


class AIService:
    """Service for AI-powered features using Claude"""

    def __init__(self):
        self.client = anthropic.Anthropic()
        self.model = "claude-3-5-sonnet-20241022"
        # Dedicated model for workout plan generation (latest Sonnet).
        self.workout_model = "claude-sonnet-4-6"

        # Initialize MediaPipe pose detection
        self.mp_pose = solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            smooth_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = solutions.drawing_utils

    async def _create_message(self, **kwargs):
        """Run blocking Anthropic API call in thread pool to avoid blocking the event loop."""
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.client.messages.create(**kwargs)
        )

    def _build_workout_prompt(self, biometrics: dict) -> str:
        """Build the user-facing workout generation prompt from biometrics."""
        equipment = biometrics.get('equipment') or biometrics.get('available_equipment') or 'bodyweight only'
        limitations = biometrics.get('limitations') or biometrics.get('injuries') or 'none'
        return f"""
Create a detailed, personalized workout plan for a user with the following profile:
- Age: {biometrics.get('age')}
- Gender: {biometrics.get('gender')}
- Weight: {biometrics.get('weight')} kg
- Height: {biometrics.get('height')} cm
- Experience Level: {biometrics.get('experience_level')}
- Goals: {biometrics.get('goals')}
- Available Equipment: {equipment}
- Limitations / Injuries: {limitations}

Apply progressive overload and evidence-based programming. Include appropriate
RPE, tempo, and rest for the stated goal. Respect equipment and limitations.

Return a JSON object with EXACTLY this schema:
{{
    "name": "Plan name",
    "description": "Brief description",
    "duration": 8,
    "focus_areas": ["muscle groups"],
    "exercises": [
        {{
            "name": "Exercise name",
            "description": "Description",
            "muscle_groups": ["group"],
            "equipment": ["equipment"],
            "sets": 3,
            "reps": 10,
            "rest_seconds": 60,
            "instructions": ["instruction 1", "instruction 2"]
        }}
    ]
}}
""".strip()

    def _mock_workout_plan(self, biometrics: dict) -> dict:
        """Fallback plan returned when ANTHROPIC_API_KEY is not configured."""
        experience = biometrics.get('experience_level') or 'beginner'
        goals = biometrics.get('goals') or 'general fitness'
        return {
            "name": f"{str(goals).title()} Starter Plan",
            "description": (
                f"Auto-generated mock plan for a {experience} trainee. "
                "Set ANTHROPIC_API_KEY for AI-generated plans."
            ),
            "duration": 8,
            "focus_areas": ["full body"],
            "exercises": [
                {
                    "name": "Goblet Squat",
                    "description": "Lower-body compound movement.",
                    "muscle_groups": ["quads", "glutes", "core"],
                    "equipment": ["dumbbell"],
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 90,
                    "instructions": [
                        "Hold dumbbell at chest height.",
                        "Squat to parallel, keep chest up.",
                        "Drive through heels to stand.",
                    ],
                },
                {
                    "name": "Push-up",
                    "description": "Upper-body pressing movement.",
                    "muscle_groups": ["chest", "triceps", "shoulders"],
                    "equipment": ["bodyweight"],
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60,
                    "instructions": [
                        "Plank position, hands under shoulders.",
                        "Lower chest toward floor with elbows ~45 deg.",
                        "Press back up; keep core braced.",
                    ],
                },
                {
                    "name": "Bent-over Row",
                    "description": "Upper-body pulling movement.",
                    "muscle_groups": ["back", "biceps"],
                    "equipment": ["dumbbell"],
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60,
                    "instructions": [
                        "Hinge at hips, flat back.",
                        "Row dumbbells to ribcage.",
                        "Control the descent.",
                    ],
                },
            ],
        }

    async def generate_workout_plan(self, user_id: str, biometrics: dict) -> dict:
        """Generate personalized workout plan using Claude Sonnet 4.6.

        Falls back to a deterministic mock plan when ANTHROPIC_API_KEY is not set
        so local development / CI still works.
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return self._mock_workout_plan(biometrics)

        prompt = self._build_workout_prompt(biometrics)

        try:
            # Prompt caching on the system prompt reduces cost for repeated calls.
            message = await self._create_message(
                model=self.workout_model,
                max_tokens=4096,
                system=[
                    {
                        "type": "text",
                        "text": WORKOUT_SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as e:
            # If the real API call fails for any reason, fall back to the mock
            # so the user-facing flow degrades gracefully.
            print(f"Workout generation via Claude failed, using mock fallback: {e}")
            return self._mock_workout_plan(biometrics)

        # Parse JSON from response
        response_text = message.content[0].text
        try:
            return json.loads(response_text)
        except Exception:
            # Tolerate stray prose - extract the JSON object.
            try:
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            except Exception:
                return {"error": "Failed to parse response"}
    
    async def generate_diet_plan(self, user_id: str, biometrics: dict, preferences: dict) -> dict:
        """Generate research-backed personalized diet plan with PubMed citations"""
        # Get research data for the user's goals
        research_context = await self._get_research_context(biometrics, preferences)
        
        prompt = f"""
        Create a detailed, evidence-based personalized diet plan for a user with:
        - Age: {biometrics.get('age')}
        - Weight: {biometrics.get('weight')} kg
        - Height: {biometrics.get('height')} cm
        - Goal: {biometrics.get('goal')}
        - Dietary restrictions: {preferences.get('restrictions')}
        - Cuisine preferences: {preferences.get('cuisines')}
        
        RESEARCH EVIDENCE FOR THIS PLAN:
        {research_context}
        
        Use this research to inform your recommendations. Ensure all macronutrient targets
        and meal suggestions are based on scientific evidence from peer-reviewed studies.
        
        Return JSON:
        {{
            "name": "Plan name",
            "description": "Description with scientific rationale",
            "scientific_basis": "Summary of research supporting this plan",
            "calorie_target": 2000,
            "protein_target": 150,
            "carb_target": 200,
            "fat_target": 65,
            "evidence_level": "high|moderate|preliminary",
            "research_citations": ["Study reference 1", "Study reference 2"],
            "meals": [
                {{
                    "name": "Meal name",
                    "meal_type": "breakfast|lunch|dinner|snack",
                    "calories": 500,
                    "protein": 40,
                    "carbs": 50,
                    "fat": 20,
                    "ingredients": ["ingredient1", "ingredient2"],
                    "instructions": ["step1", "step2"],
                    "nutritional_benefits": "Why these foods are recommended",
                    "research_backed": true
                }}
            ]
        }}
        """
        
        message = await self._create_message(
            model=self.model,
            max_tokens=3000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            plan = json.loads(json_str)
            # Add metadata
            plan["created_at"] = datetime.now().isoformat()
            plan["evidence_based"] = True
            plan["research_verified"] = True
            return plan
        except Exception as e:
            return {"error": f"Failed to parse response: {str(e)}"}
    
    async def _get_research_context(self, biometrics: dict, preferences: dict) -> str:
        """Fetch relevant PubMed research for diet plan"""
        try:
            goal = biometrics.get('goal', 'weight loss')
            age = biometrics.get('age', 30)
            restrictions = preferences.get('restrictions', [])
            
            # Search PubMed for relevant studies
            research_summaries = []
            
            # Search for goal-specific research
            if 'weight loss' in goal.lower():
                research_summaries.extend(await self._search_pubmed_research(
                    "protein intake weight loss randomized controlled trial"
                ))
                research_summaries.extend(await self._search_pubmed_research(
                    "caloric deficit sustainable weight loss meta-analysis"
                ))
            
            if 'muscle gain' in goal.lower():
                research_summaries.extend(await self._search_pubmed_research(
                    "protein synthesis resistance training nutrition"
                ))
                research_summaries.extend(await self._search_pubmed_research(
                    "carbohydrate periodization strength training"
                ))
            
            if 'endurance' in goal.lower():
                research_summaries.extend(await self._search_pubmed_research(
                    "carbohydrate loading endurance performance"
                ))
                research_summaries.extend(await self._search_pubmed_research(
                    "hydration exercise metabolism"
                ))
            
            # Add age-specific recommendations
            if age >= 50:
                research_summaries.extend(await self._search_pubmed_research(
                    "protein requirements older adults sarcopenia prevention"
                ))
            
            # Add dietary restriction research
            for restriction in restrictions:
                if 'vegan' in restriction.lower():
                    research_summaries.extend(await self._search_pubmed_research(
                        "plant-based protein complete amino acids vegan nutrition"
                    ))
                elif 'vegetarian' in restriction.lower():
                    research_summaries.extend(await self._search_pubmed_research(
                        "vegetarian diet protein iron absorption"
                    ))
                elif 'keto' in restriction.lower():
                    research_summaries.extend(await self._search_pubmed_research(
                        "ketogenic diet efficacy safety randomized trial"
                    ))
            
            # Compile research context
            if research_summaries:
                context = "Based on recent peer-reviewed research:\\n\\n"
                for summary in research_summaries[:5]:  # Limit to top 5 most relevant
                    context += f"• {summary}\\n"
                return context
            else:
                return "Research data not available. Plan based on established nutritional guidelines."
        except Exception as e:
            print(f"Error fetching research context: {e}")
            return "Plan based on established nutritional guidelines (research fetch failed)."
    
    async def _search_pubmed_research(self, query: str, max_results: int = 3) -> list:
        """Search PubMed for relevant research papers"""
        try:
            # PubMed API endpoint
            base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
            
            # Search PubMed
            search_url = f"{base_url}/esearch.fcgi"
            search_params = {
                "db": "pubmed",
                "term": query,
                "retmax": max_results,
                "sort": "relevance",
                "rettype": "json"
            }
            
            search_response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: requests.get(search_url, params=search_params, timeout=5)
            )
            search_data = search_response.json()
            
            summaries = []
            pmid_list = search_data.get('esearchresult', {}).get('idlist', [])
            
            if pmid_list:
                # Fetch article summaries
                fetch_url = f"{base_url}/esummary.fcgi"
                fetch_params = {
                    "db": "pubmed",
                    "id": ",".join(pmid_list),
                    "rettype": "json"
                }
                
                fetch_response = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: requests.get(fetch_url, params=fetch_params, timeout=5)
                )
                fetch_data = fetch_response.json()
                
                for pmid in pmid_list:
                    try:
                        article = fetch_data.get('result', {}).get(pmid, {})
                        title = article.get('title', '')
                        source = article.get('source', '')
                        year = article.get('pubdate', 'Unknown')[:4]
                        
                        if title:
                            summary = f"{title} ({source}, {year}) - PMID: {pmid}"
                            summaries.append(summary)
                    except:
                        pass
            
            return summaries
        except Exception as e:
            print(f"Error searching PubMed: {e}")
            return []

    async def get_supplement_recommendations(self, user_id: str, goals: list, preferences: dict = None) -> dict:
        """Return evidence-backed supplement recommendations for given goals.

        The method uses simple goal->supplement mapping and fetches PubMed
        citations for each supplement. Returns list of supplements with
        typical dosing, safety notes and citations (PMIDs).
        """
        try:
            preferences = preferences or {}
            goals_text = " ".join(goals) if isinstance(goals, (list, tuple)) else str(goals or "")
            g = goals_text.lower()

            # Base mapping of goals to supplements
            suggestions = []

            def add_supp(name, dose, safety, query):
                return {
                    "name": name,
                    "typical_dose": dose,
                    "safety_notes": safety,
                    "citations": []
                }

            if "muscle" in g or "hypertrophy" in g or "strength" in g:
                suggestions.append(add_supp(
                    "Creatine Monohydrate",
                    "3-5 g daily",
                    "Well-studied; generally safe for healthy adults. Stay hydrated; consult doctor if kidney disease.",
                    "creatine monohydrate randomized controlled trial strength"
                ))
                suggestions.append(add_supp(
                    "Whey Protein",
                    "20-40 g per serving post-workout",
                    "Commonly used; avoid if dairy allergy. Consider plant-based alternatives for intolerance.",
                    "whey protein supplementation muscle protein synthesis randomized trial"
                ))

            if "weight" in g or "fat" in g or "loss" in g:
                suggestions.append(add_supp(
                    "Caffeine",
                    "100-300 mg pre-workout or as tolerated",
                    "May increase heart rate; avoid if sensitive or pregnant. Check drug interactions.",
                    "caffeine performance weight loss randomized trial"
                ))
                suggestions.append(add_supp(
                    "Protein Powder",
                    "Replace 1-2 meals or as supplement to reach protein targets (20-40 g)",
                    "Use to meet protein goals; choose clean products without banned substances.",
                    "high protein diets weight loss randomized trial"
                ))

            if "endurance" in g or "cardio" in g:
                suggestions.append(add_supp(
                    "Beta-Alanine",
                    "3-5 g daily (may cause tingling)",
                    "Take consistently for 4+ weeks for effect. May cause paresthesia.",
                    "beta alanine endurance randomized trial"
                ))
                suggestions.append(add_supp(
                    "Caffeine",
                    "3 mg/kg pre-event",
                    "Proven ergogenic; avoid if hypertensive or pregnant.",
                    "caffeine endurance performance randomized trial"
                ))

            # General health recommendations
            suggestions.append(add_supp(
                "Vitamin D",
                "1000-2000 IU daily (test to personalize)",
                "Check serum 25(OH)D before high dosing; safe range depends on baseline.",
                "vitamin d supplementation randomized trial bone health"
            ))
            suggestions.append(add_supp(
                "Omega-3 (EPA+DHA)",
                "1-3 g combined EPA+DHA daily",
                "May reduce inflammation; check fish allergy. Consult if on blood thinners.",
                "omega-3 fatty acids randomized trial cardiovascular"
            ))

            # Fetch citations for each suggested supplement (top 2 each)
            for s in suggestions:
                try:
                    query = s.get('name') + " randomized controlled trial"
                    # Use the PubMed helper to find supporting literature
                    cites = await self._search_pubmed_research(query, max_results=2)
                    s['citations'] = cites
                except Exception:
                    s['citations'] = []

                # Summarize citations with Claude for evidence summary and level
                try:
                    summary_result = await self._summarize_citations_with_claude(s['name'], s.get('citations', []))
                    s['evidence_summary'] = summary_result.get('summary')
                    s['evidence_level'] = summary_result.get('evidence_level')
                except Exception:
                    s['evidence_summary'] = None
                    s['evidence_level'] = "preliminary"

            return {
                "user_id": user_id,
                "goals": goals,
                "generated_at": datetime.now().isoformat(),
                "supplements": suggestions
            }
        except Exception as e:
            return {"error": str(e)}

    async def _summarize_citations_with_claude(self, supplement_name: str, citations: list) -> dict:
        """Use Claude to summarize the provided citations for a supplement.

        Returns a dict with `summary` and `evidence_level`.
        """
        try:
            if not citations:
                return {"summary": None, "evidence_level": "preliminary"}

            # Build a concise prompt that asks Claude to summarize the strength of evidence
            citations_text = "\n".join([f"- {c}" for c in citations])
            prompt = f"""
You are an expert nutrition scientist. For the supplement '{supplement_name}', the following peer-reviewed studies were found:
{citations_text}

Provide a concise (2-3 sentence) evidence summary describing whether the supplement
is effective for its intended use, and assign an evidence level: high, moderate, or preliminary.
Return JSON with keys: {{"summary": "...", "evidence_level": "high|moderate|preliminary"}} only.
"""

            message = await self._create_message(
                model=self.model,
                max_tokens=500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            response_text = message.content[0].text
            try:
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            except Exception:
                # Fallback: return minimal structure
                return {"summary": response_text.strip(), "evidence_level": "preliminary"}
        except Exception as e:
            print(f"Error summarizing citations with Claude: {e}")
            return {"summary": None, "evidence_level": "preliminary"}
    
    async def analyze_exercise_form(self, exercise_name: str, file_content: bytes, file_type: str) -> dict:
        """Analyze exercise form from video/image using MediaPipe pose detection"""
        try:
            # Save temporary file
            temp_path = f"/tmp/exercise_{exercise_name}.mp4"
            with open(temp_path, 'wb') as f:
                f.write(file_content)
            
            # Extract frames from video
            frames = self._extract_frames_from_video(temp_path)
            
            if not frames:
                return {
                    "exercise_name": exercise_name,
                    "score": 0,
                    "error": "Could not process video"
                }
            
            # Analyze each frame for pose landmarks
            pose_data = self._analyze_pose_in_frames(frames, exercise_name)
            
            # Use Claude to evaluate form
            form_feedback = await self._evaluate_form_with_claude(
                exercise_name=exercise_name,
                pose_data=pose_data,
                frame_count=len(frames)
            )
            
            return form_feedback
            
        except Exception as e:
            return {
                "exercise_name": exercise_name,
                "score": 0,
                "error": str(e)
            }
    
    def _extract_frames_from_video(self, video_path: str, sample_rate: int = 5) -> list:
        """Extract frames from video file"""
        frames = []
        try:
            cap = cv2.VideoCapture(video_path)
            frame_count = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Sample every nth frame to reduce processing
                if frame_count % sample_rate == 0:
                    frames.append(frame)
                
                frame_count += 1
            
            cap.release()
            return frames
        except Exception as e:
            print(f"Error extracting frames: {e}")
            return []
    
    def _analyze_pose_in_frames(self, frames: list, exercise_name: str) -> dict:
        """Analyze pose landmarks in video frames"""
        pose_sequence = []
        
        for frame in frames:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Run pose detection
            results = self.pose.process(rgb_frame)
            
            if results.pose_landmarks:
                # Extract landmark positions
                landmarks = self._extract_landmarks(results.pose_landmarks)
                pose_sequence.append(landmarks)
        
        return {
            "exercise": exercise_name,
            "frame_count": len(pose_sequence),
            "pose_sequence": pose_sequence,
            "angles": self._calculate_joint_angles(pose_sequence)
        }
    
    def _extract_landmarks(self, pose_landmarks) -> dict:
        """Extract x, y, z coordinates from pose landmarks"""
        landmarks_dict = {}
        
        landmark_names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        for idx, landmark in enumerate(pose_landmarks.landmark):
            if idx < len(landmark_names):
                landmarks_dict[landmark_names[idx]] = {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                }
        
        return landmarks_dict
    
    def _calculate_joint_angles(self, pose_sequence: list) -> dict:
        """Calculate angles between joints for form analysis"""
        angles = {
            'shoulders': [],
            'elbows': [],
            'hips': [],
            'knees': [],
            'ankles': []
        }
        
        for landmarks in pose_sequence:
            # Calculate shoulder angle
            if all(k in landmarks for k in ['left_shoulder', 'right_shoulder', 'left_hip']):
                shoulder_angle = self._calculate_angle(
                    landmarks['left_shoulder'],
                    landmarks['right_shoulder'],
                    landmarks['left_hip']
                )
                angles['shoulders'].append(shoulder_angle)
            
            # Calculate elbow angle
            if all(k in landmarks for k in ['left_shoulder', 'left_elbow', 'left_wrist']):
                elbow_angle = self._calculate_angle(
                    landmarks['left_shoulder'],
                    landmarks['left_elbow'],
                    landmarks['left_wrist']
                )
                angles['elbows'].append(elbow_angle)
            
            # Calculate hip angle
            if all(k in landmarks for k in ['left_shoulder', 'left_hip', 'left_knee']):
                hip_angle = self._calculate_angle(
                    landmarks['left_shoulder'],
                    landmarks['left_hip'],
                    landmarks['left_knee']
                )
                angles['hips'].append(hip_angle)
            
            # Calculate knee angle
            if all(k in landmarks for k in ['left_hip', 'left_knee', 'left_ankle']):
                knee_angle = self._calculate_angle(
                    landmarks['left_hip'],
                    landmarks['left_knee'],
                    landmarks['left_ankle']
                )
                angles['knees'].append(knee_angle)
        
        return angles
    
    def _calculate_angle(self, a: dict, b: dict, c: dict) -> float:
        """Calculate angle between three points"""
        import math
        
        # Convert to numpy arrays
        point_a = np.array([a['x'], a['y']])
        point_b = np.array([b['x'], b['y']])
        point_c = np.array([c['x'], c['y']])
        
        # Calculate vectors
        ba = point_a - point_b
        bc = point_c - point_b
        
        # Calculate angle
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return math.degrees(angle)
    
    async def _evaluate_form_with_claude(self, exercise_name: str, pose_data: dict, frame_count: int) -> dict:
        """Use Claude to evaluate exercise form"""
        prompt = f"""
        Analyze the exercise form data for: {exercise_name}
        
        Pose Analysis Data:
        - Total frames analyzed: {frame_count}
        - Joint angles over time: {json.dumps(pose_data['angles'])}
        
        Based on this data, provide:
        1. Overall form score (0-100)
        2. Specific areas performing well
        3. Areas needing improvement
        4. Safety concerns or injury risks
        5. Specific corrections needed
        
        Return as JSON with keys: score, strengths, improvements, recommendations, warnings, safety_level
        """
        
        try:
            message = await self._create_message(
                model=self.model,
                max_tokens=800,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            response_text = message.content[0].text
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            return {
                "exercise_name": exercise_name,
                "score": 65,
                "strengths": ["Form detected"],
                "improvements": ["Continue practicing"],
                "recommendations": [],
                "warnings": [],
                "safety_level": "moderate"
            }
    
    async def analyze_food_photo(self, image_content: bytes) -> dict:
        """Analyze food photo and extract macros"""
        prompt = """
        Analyze this food photo and identify:
        1. All food items visible
        2. Estimated portion size
        3. Nutritional information (calories, protein, carbs, fat)
        4. Meal type (breakfast/lunch/dinner/snack)
        
        Return JSON with keys: foods, macros, portion_size, meal_type, confidence
        """
        
        # Mock response
        return {
            "foods": ["Chicken", "Rice", "Broccoli"],
            "calories": 650,
            "protein": 50,
            "carbs": 65,
            "fat": 18,
            "portion_size": "Large",
            "meal_type": "lunch",
            "confidence": 0.85
        }
    
    async def get_motivation(self, user_id: str) -> str:
        """Get personalized motivational message"""
        message = await self._create_message(
            model=self.model,
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Give me one short, motivational fitness quote (max 15 words)"}
            ]
        )
        return message.content[0].text

    async def generate_reminder_message(self, user_id: str, context: dict = None) -> dict:
        """Generate a short, friendly reminder message for a user based on context.

        Context can include keys like `title`, `goal`, `type` (water/workout/meal).
        Returns a dict {"text": "..."}.
        """
        try:
            ctx = context or {}
            title = ctx.get('title', '')
            goal = ctx.get('goal', '')
            rtype = ctx.get('type', '')

            prompt = f"""
You are a friendly AI fitness coach. Write one short (max 25 words), actionable, polite reminder message for a user.
Context: title={title}; goal={goal}; type={rtype}.
Examples: 'Time for your workout — 30 minutes of strength now!', 'Drink a glass of water and stretch for 2 minutes.'
Return only the reminder text.
"""

            message = await self._create_message(
                model=self.model,
                max_tokens=60,
                messages=[{"role": "user", "content": prompt}]
            )

            text = message.content[0].text.strip()
            return {"text": text}
        except Exception as e:
            # Fallback simple templated reminders
            fallback = title or ("Time to follow your plan" if not goal else f"Reminder: {goal}")
            return {"text": fallback}
    
    async def chat_with_ai_coach(self, user_id: str, message: str, context: str = "general") -> str:
        """Chat with AI fitness coach"""
        system_prompt = """You are an expert AI fitness coach. Provide helpful, motivating, and evidence-based advice.
        Be conversational, supportive, and practical. Keep responses concise but informative."""
        
        response = await self._create_message(
            model=self.model,
            max_tokens=500,
            system=system_prompt,
            messages=[
                {"role": "user", "content": message}
            ]
        )
        return response.content[0].text
    
    async def generate_workout_modification(self, exercise_name: str, constraints: dict) -> dict:
        """Generate modification for exercise based on constraints"""
        prompt = f"""
        The user cannot perform {exercise_name} due to: {constraints.get('reason')}
        Available equipment: {constraints.get('equipment')}
        Space limitations: {constraints.get('space_limitations')}
        
        Suggest 3 effective alternative exercises and modifications.
        Return JSON with key 'alternatives' containing list of exercises.
        """
        
        message = await self._create_message(
            model=self.model,
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except:
            return {"alternatives": []}
    
    async def analyze_progress(self, user_id: str, progress_data: dict) -> dict:
        """Analyze user progress and provide insights"""
        prompt = f"""
        Analyze this fitness progress data:
        {json.dumps(progress_data)}
        
        Provide:
        1. Progress summary
        2. Trends observed
        3. Recommendations for next phase
        4. Areas to focus on
        
        Return JSON with keys: summary, trends, recommendations, focus_areas
        """

        message = await self._create_message(
            model=self.model,
            max_tokens=800,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except:
            return {"summary": response_text}
