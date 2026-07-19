from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models import User, Message
from app.database import get_db
from app.auth import get_current_user
from app.ai_service import AIService
from app.domain.ai.budget import check_and_increment
from app.middleware.rate_limit import limiter

router = APIRouter()
ai_service = AIService()


class ChatRequest(BaseModel):
    message: str | None = None
    content: str | None = None  # accept legacy field name
    context: str = "general"

    @property
    def text(self) -> str:
        return (self.message or self.content or "").strip()


class NutritionAdviceRequest(BaseModel):
    meal_type: str = "general"
    preferences: dict = {}
    question: str | None = None


class AskRequest(BaseModel):
    question: str
    category: str = "general"


class PersonalizedPlanRequest(BaseModel):
    goals: list = []
    duration: int = 8


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
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI fitness coach. Reads JSON body {message|content, context}."""
    _enforce_budget(current_user, "ai_chat")
    text = payload.text
    if not text:
        raise HTTPException(status_code=400, detail="message is required")
    try:
        response = await ai_service.chat_with_ai_coach(current_user.id, text, payload.context)
        user_msg = Message(
            user_id=current_user.id,
            sender_type="user",
            content=text,
            message_type="text",
        )
        ai_msg = Message(
            user_id=current_user.id,
            sender_type="ai",
            content=response,
            message_type="text",
        )
        db.add(user_msg)
        db.add(ai_msg)
        db.commit()
        return {
            "user_message_id": user_msg.id,
            "ai_message_id": ai_msg.id,
            "response": response,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/motivation")
async def get_motivation(
    user_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a motivational message for the authenticated user."""
    _enforce_budget(current_user, "motivation")
    try:
        # Always scope to the caller — never generate from an arbitrary user_id
        # (that would leak another user's context and charge budget to the caller).
        motivation = await ai_service.get_motivation(current_user.id)
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
    payload: NutritionAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal_type = payload.meal_type
    preferences = payload.preferences or {}
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
    payload: PersonalizedPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized plan"""
    goals = payload.goals
    duration = payload.duration
    try:
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
    payload: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask AI coach a question"""
    _enforce_budget(current_user, "ai_chat")
    question = payload.question
    category = payload.category
    try:
        response = await ai_service.chat_with_ai_coach(current_user.id, question, category)

        message = Message(
            user_id=current_user.id,
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
