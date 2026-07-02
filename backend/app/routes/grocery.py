"""Grocery list derived from the user's most recent diet plan."""
from collections import OrderedDict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import DietPlan, Meal, User

router = APIRouter()

_CATEGORIES = [
    ("proteins", "Proteins", ["chicken", "beef", "salmon", "fish", "egg", "yogurt", "tofu",
                                "turkey", "pork", "shrimp", "whey", "protein", "steak", "tuna"]),
    ("carbs", "Carbs", ["rice", "oat", "bread", "pasta", "potato", "quinoa", "cereal",
                         "bagel", "tortilla", "noodle"]),
    ("produce", "Produce", ["spinach", "broccoli", "kale", "lettuce", "tomato", "pepper",
                             "onion", "carrot", "cucumber", "berry", "banana", "apple",
                             "avocado", "fruit", "vegetable", "greens"]),
    ("fats", "Fats & Dairy", ["oil", "butter", "nut", "almond", "peanut", "seed", "cheese", "milk"]),
]


def _categorize(name: str) -> str:
    low = name.lower()
    for key, _label, kws in _CATEGORIES:
        if any(k in low for k in kws):
            return key
    return "other"


@router.get("/list")
def grocery_list(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = (
        db.query(DietPlan)
        .filter(DietPlan.user_id == current_user.id)
        .order_by(DietPlan.created_at.desc())
        .first()
    )
    counts: dict = {}
    if plan:
        meals = db.query(Meal).filter(Meal.diet_plan_id == plan.id).all()
        for m in meals:
            for ing in (m.ingredients or []):
                key = str(ing).strip()
                if key:
                    counts[key] = counts.get(key, 0) + 1

    buckets = OrderedDict((k, {"id": k, "label": label, "items": []}) for k, label, _ in _CATEGORIES)
    buckets["other"] = {"id": "other", "label": "Other", "items": []}
    for name, n in sorted(counts.items()):
        cat = _categorize(name)
        buckets[cat]["items"].append({"name": name, "quantity": (f"x{n}" if n > 1 else "")})

    categories = [b for b in buckets.values() if b["items"]]
    return {"plan_id": plan.id if plan else None, "categories": categories}
