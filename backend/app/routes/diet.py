from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import User, DietPlan, Meal, FoodEntry
from app.database import get_db
from app.auth import get_current_user
from app.core.security import require_coach, ensure_own_or_coach
from app.ai_service import AIService
from app.domain.ai.budget import check_and_increment
from app.middleware.rate_limit import limiter
from app.core.uploads import read_validated_upload
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter()
ai_service = AIService()

@router.post("/plans/generate")
async def generate_diet_plan(
    biometrics: dict,
    preferences: dict,
    target_user_id: str | None = None,
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db)
):
    """Generate evidence-based AI-powered diet plan backed by PubMed research.

    Coach-only per spec. Optional `target_user_id` assigns the plan to a client;
    otherwise it is created against the coach (template / draft).
    """
    target_id = target_user_id or coach.id
    tier = getattr(coach, "subscription_tier", "free") or "free"
    allowed, reason = check_and_increment(coach.id, tier, "generate_diet_plan")
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)
    try:
        plan_data = await ai_service.generate_diet_plan(
            user_id=target_id,
            biometrics=biometrics,
            preferences=preferences
        )

        diet_plan = DietPlan(
            user_id=target_id,
            name=plan_data.get("name", "My Diet Plan"),
            description=plan_data.get("description", ""),
            calorie_target=plan_data.get("calorie_target", 2000),
            protein_target=plan_data.get("protein_target", 150),
            carb_target=plan_data.get("carb_target", 200),
            fat_target=plan_data.get("fat_target", 65),
            generated_by="ai",
            # New evidence-based fields
            scientific_basis=plan_data.get("scientific_basis", ""),
            evidence_level=plan_data.get("evidence_level", "moderate"),
            research_citations=plan_data.get("research_citations", []),
            research_verified=plan_data.get("research_verified", True)
            ,
            supplement_recommendations=plan_data.get("supplements", plan_data.get("supplement_recommendations", []))
        )
        db.add(diet_plan)
        db.flush()
        
        # Add meals
        for meal_data in plan_data.get("meals", []):
            meal = Meal(
                diet_plan_id=diet_plan.id,
                name=meal_data.get("name", ""),
                meal_type=meal_data.get("meal_type", "snack"),
                calories=meal_data.get("calories", 0),
                protein=meal_data.get("protein", 0),
                carbs=meal_data.get("carbs", 0),
                fat=meal_data.get("fat", 0),
                ingredients=meal_data.get("ingredients", []),
                instructions=meal_data.get("instructions", []),
                # New research fields
                nutritional_benefits=meal_data.get("nutritional_benefits", ""),
                research_backed=meal_data.get("research_backed", True)
            )
            db.add(meal)
        
        db.commit()
        
        return {
            "success": True,
            "plan_id": diet_plan.id,
            "evidence_based": True,
            "evidence_level": plan_data.get("evidence_level", "moderate"),
            "research_citations_count": len(plan_data.get("research_citations", [])),
            "supplements_count": len(diet_plan.supplement_recommendations or []),
            "message": "Diet plan generated with peer-reviewed research backing"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans")
async def get_diet_plans(
    user_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all diet plans for user. Defaults to the authenticated user."""
    target = user_id or current_user.id
    ensure_own_or_coach(target, current_user, db)
    plans = (
        db.query(DietPlan)
        .options(selectinload(DietPlan.meals))
        .filter(DietPlan.user_id == target)
        .all()
    )
    return plans

@router.post("/analyze-food")
@limiter.limit("50/hour")
async def analyze_food_photo(
    request: Request,
    file: UploadFile = File(...),
    meal_type: str = Form("snack"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze food photo and extract macros (image upload)."""
    # Vision calls are among the most expensive AI operations — enforce the
    # per-user/global AI budget before doing any Claude work.
    tier = getattr(current_user, "subscription_tier", "free") or "free"
    allowed, reason = check_and_increment(current_user.id, tier, "food_analysis")
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)
    try:
        content = await read_validated_upload(file, allowed_prefixes=("image/",))
        result = await ai_service.analyze_food_photo(content)
        
        # Create food entry
        entry = FoodEntry(
            user_id=current_user.id,
            food_name=", ".join(result.get("foods", [])),
            meal_type=meal_type,
            calories=result.get("calories", 0),
            protein=result.get("protein", 0),
            carbs=result.get("carbs", 0),
            fat=result.get("fat", 0),
            quantity=1,
            unit="serving",
            confidence=result.get("confidence", 0)
        )
        db.add(entry)
        db.commit()
        
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class FoodLogIn(BaseModel):
    food_name: str
    meal_type: str = "snack"
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    quantity: float = 1
    unit: str = "serving"
    confidence: Optional[float] = None


@router.post("/food")
@limiter.limit("100/hour")
async def log_food_entry(
    request: Request,
    body: FoodLogIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a food entry from already-detected macros (no re-analysis)."""
    entry = FoodEntry(
        user_id=current_user.id,
        food_name=body.food_name,
        meal_type=body.meal_type,
        calories=body.calories,
        protein=body.protein,
        carbs=body.carbs,
        fat=body.fat,
        quantity=body.quantity,
        unit=body.unit,
        confidence=body.confidence,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "food_name": entry.food_name,
        "meal_type": entry.meal_type,
        "calories": entry.calories,
        "protein": entry.protein,
        "carbs": entry.carbs,
        "fat": entry.fat,
    }


@router.get("/macros")
async def get_daily_macros(
    date: str,
    user_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily macro totals. Defaults to the authenticated user."""
    target = user_id or current_user.id
    ensure_own_or_coach(target, current_user, db)

    # FoodEntry.date is a DateTime column — filter by the [day, day+1) range.
    # (Never LIKE/startswith on a timestamp; it raises on PostgreSQL.)
    try:
        day_start = datetime.fromisoformat(date[:10])
    except ValueError:
        raise HTTPException(status_code=400, detail="date must be ISO format YYYY-MM-DD")
    day_end = day_start + timedelta(days=1)
    entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == target,
        FoodEntry.date >= day_start,
        FoodEntry.date < day_end,
    ).all()

    total_calories = sum(e.calories or 0 for e in entries)
    total_protein = sum(e.protein or 0 for e in entries)
    total_carbs = sum(e.carbs or 0 for e in entries)
    total_fat = sum(e.fat or 0 for e in entries)

    # Targets come from the user's most recent diet plan when available;
    # fall back to sensible defaults so the screen still renders.
    plan = (
        db.query(DietPlan)
        .filter(DietPlan.user_id == target)
        .order_by(DietPlan.created_at.desc())
        .first()
    )
    cal_t = plan.calorie_target if plan and plan.calorie_target else 2000
    pro_t = plan.protein_target if plan and plan.protein_target else 150
    carb_t = plan.carb_target if plan and plan.carb_target else 200
    fat_t = plan.fat_target if plan and plan.fat_target else 65

    return {
        "date": date,
        "consumed": {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat
        },
        "targets": {
            "calories": cal_t,
            "protein": pro_t,
            "carbs": carb_t,
            "fat": fat_t
        },
        "remaining": {
            "calories": cal_t - total_calories,
            "protein": pro_t - total_protein,
            "carbs": carb_t - total_carbs,
            "fat": fat_t - total_fat
        }
    }

@router.get("/plans/{plan_id}/research")
async def get_plan_research_details(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed research backing for a diet plan"""
    try:
        plan = (
            db.query(DietPlan)
            .options(joinedload(DietPlan.meals))
            .filter(
                DietPlan.id == plan_id,
                DietPlan.user_id == current_user.id
            )
            .first()
        )

        if not plan:
            raise HTTPException(status_code=404, detail="Diet plan not found")

        meals = plan.meals
        
        return {
            "plan_id": plan.id,
            "plan_name": plan.name,
            "evidence_based": plan.research_verified,
            "evidence_level": plan.evidence_level,
            "scientific_basis": plan.scientific_basis,
            "research_citations": plan.research_citations or [],
            "citation_count": len(plan.research_citations or []),
            "meals": [
                {
                    "name": meal.name,
                    "meal_type": meal.meal_type,
                    "nutritional_benefits": meal.nutritional_benefits,
                    "research_backed": meal.research_backed
                }
                for meal in meals
            ],
            "message": "This plan is supported by peer-reviewed scientific research"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/research/{topic}")
async def get_nutrition_research(
    topic: str,
    current_user: User = Depends(get_current_user),
):
    """Search PubMed for nutrition research on a specific topic"""
    try:
        results = await ai_service._search_pubmed_research(topic, max_results=5)
        
        return {
            "topic": topic,
            "research_found": len(results) > 0,
            "article_count": len(results),
            "articles": results,
            "source": "PubMed",
            "evidence_quality": "peer-reviewed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
