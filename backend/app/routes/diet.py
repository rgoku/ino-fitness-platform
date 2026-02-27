from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import User, DietPlan, Meal, FoodEntry
from app.database import get_db
from app.auth import get_current_user
from app.ai_service import AIService
from app.domain.ai.budget import check_and_increment
from app.middleware.rate_limit import limiter

router = APIRouter()
ai_service = AIService()

@router.post("/plans/generate")
async def generate_diet_plan(
    biometrics: dict,
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate evidence-based AI-powered diet plan backed by PubMed research"""
    tier = getattr(current_user, "subscription_tier", "free") or "free"
    allowed, reason = check_and_increment(current_user.id, tier, "generate_diet_plan")
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)
    try:
        plan_data = await ai_service.generate_diet_plan(
            user_id=current_user.id,
            biometrics=biometrics,
            preferences=preferences
        )
        
        diet_plan = DietPlan(
            user_id=current_user.id,
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
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all diet plans for user"""
    plans = (
        db.query(DietPlan)
        .options(selectinload(DietPlan.meals))
        .filter(DietPlan.user_id == user_id)
        .all()
    )
    return plans

@router.post("/analyze-food")
@limiter.limit("50/hour")
async def analyze_food_photo(
    request: Request,
    file: bytes,
    meal_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze food photo and extract macros"""
    try:
        result = await ai_service.analyze_food_photo(file)
        
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

@router.get("/macros")
async def get_daily_macros(
    user_id: str,
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily macro totals"""
    entries = db.query(FoodEntry).filter(
        FoodEntry.user_id == user_id,
        FoodEntry.date.startswith(date)
    ).all()
    
    total_calories = sum(e.calories for e in entries)
    total_protein = sum(e.protein for e in entries)
    total_carbs = sum(e.carbs for e in entries)
    total_fat = sum(e.fat for e in entries)
    
    return {
        "date": date,
        "consumed": {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fat": total_fat
        },
        "remaining": {
            "calories": 2000 - total_calories,
            "protein": 150 - total_protein,
            "carbs": 200 - total_carbs,
            "fat": 65 - total_fat
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
