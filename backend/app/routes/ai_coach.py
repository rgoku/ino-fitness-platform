from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.models import User, Message
from app.database import get_db
from app.auth import get_current_user
from app.ai_service import AIService
from app.domain.ai.budget import check_and_increment
from app.middleware.rate_limit import limiter

router = APIRouter()
ai_service = AIService()


def _enforce_budget(user: User, task_type: str) -> None:
    """Check AI budget before calling Claude. Raises 429 if exceeded."""
    tier = getattr(user, "subscription_tier", "free") or "free"
    allowed, reason = check_and_increment(user.id, tier, task_type)
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)

@router.post("/chat")
@limiter.limit("30/hour")
async def chat_with_ai(
    request: Request,
    user_id: str,
    content: str,
    context: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI fitness coach"""
    _enforce_budget(current_user, "ai_chat")
    try:
        response = await ai_service.chat_with_ai_coach(user_id, content, context)
        
        # Store messages
        user_msg = Message(
            user_id=user_id,
            sender_type="user",
            content=content,
            message_type="text"
        )
        ai_msg = Message(
            user_id=user_id,
            sender_type="ai",
            content=response,
            message_type="text"
        )
        db.add(user_msg)
        db.add(ai_msg)
        db.commit()
        
        return {
            "user_message_id": user_msg.id,
            "ai_message_id": ai_msg.id,
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/motivation")
async def get_motivation(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get motivational message"""
    _enforce_budget(current_user, "motivation")
    try:
        motivation = await ai_service.get_motivation(user_id)
        return {"message": motivation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tips")
async def get_workout_tips(
    exercise: str,
    level: str = "intermediate",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tips for exercise"""
    return {
        "exercise": exercise,
        "tips": [
            "Keep your core engaged throughout",
            "Maintain controlled movements",
            "Focus on form over weight"
        ]
    }

@router.post("/nutrition-advice")
async def get_nutrition_advice(
    meal_type: str,
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI nutrition advice"""
    _enforce_budget(current_user, "supplement_evidence")
    try:
        # Basic nutrition advice via AI service (if available)
        advice = "Focus on lean protein and whole grains for this meal"

        # Generate supplement recommendations based on user's goal/preferences
        goals = []
        if hasattr(current_user, 'fitness_goal') and current_user.fitness_goal:
            goals.append(current_user.fitness_goal)
        if preferences and preferences.get('goals'):
            # preferences may contain explicit goals
            goals.extend(preferences.get('goals'))

        supplements = await ai_service.get_supplement_recommendations(
            user_id=current_user.id,
            goals=goals or [meal_type],
            preferences=preferences
        )

        return {
            "advice": advice,
            "suggestions": supplements.get('supplements', []),
            "research_meta": {
                "generated_at": supplements.get('generated_at')
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/progress-analysis")
async def analyze_progress(
    user_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze user progress with AI"""
    return {
        "summary": "Great progress this month!",
        "trends": "Consistent workout schedule",
        "recommendations": "Increase intensity gradually"
    }

@router.post("/personalized-plan")
@limiter.limit("10/hour")
async def generate_personalized_plan(
    request: Request,
    user_id: str,
    goals: list,
    duration: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized plan"""
    try:
        # Create the plan (placeholder existing logic could be replaced by AIService)
        plan = {
            "plan_id": "plan_123",
            "goals": goals,
            "duration_weeks": duration,
            "status": "created"
        }

        # Attach evidence-backed supplement recommendations for the plan
        supplements = await ai_service.get_supplement_recommendations(
            user_id=current_user.id,
            goals=goals,
            preferences={}
        )

        plan["supplements"] = supplements.get('supplements', [])
        plan["supplement_meta"] = {"generated_at": supplements.get('generated_at')}

        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask")
@limiter.limit("30/hour")
async def ask_question(
    request: Request,
    user_id: str,
    question: str,
    category: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask AI coach a question"""
    _enforce_budget(current_user, "ai_chat")
    try:
        response = await ai_service.chat_with_ai_coach(user_id, question, category)
        
        message = Message(
            user_id=user_id,
            sender_type="ai",
            content=response,
            message_type="text"
        )
        db.add(message)
        db.commit()
        # Optionally include supplement recommendations when category relates to nutrition
        result = {
            "message_id": message.id,
            "answer": response
        }

        if category.lower() in ("nutrition", "supplements", "supplement"):
            try:
                # try to infer goals from current_user
                goals = []
                if hasattr(current_user, 'fitness_goal') and current_user.fitness_goal:
                    goals.append(current_user.fitness_goal)

                supplements = await ai_service.get_supplement_recommendations(
                    user_id=current_user.id,
                    goals=goals or ["general health"],
                    preferences={}
                )
                result["supplements"] = supplements.get('supplements', [])
            except Exception:
                result["supplements"] = []

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_personalized_insights(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered insights"""
    return {
        "insights": [
            "Your consistency is your biggest strength",
            "Consider increasing cardio for better endurance"
        ]
    }

@router.get("/search")
async def search_knowledge_base(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search knowledge base"""
    return {
        "query": q,
        "results": [
            {"title": "How to improve squat form", "url": "#"},
            {"title": "Best exercises for glutes", "url": "#"}
        ]
    }
