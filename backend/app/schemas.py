from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None

class ExerciseCreate(BaseModel):
    name: str
    description: str
    muscle_groups: List[str]
    equipment: List[str]
    instructions: List[str]
    sets: int = 3
    reps: int = 10
    rest_seconds: int = 60

class WorkoutPlanCreate(BaseModel):
    name: str
    description: str
    difficulty: str
    duration: int
    focus_areas: List[str]
    exercises: List[ExerciseCreate]

class MealCreate(BaseModel):
    name: str
    meal_type: str
    calories: float
    protein: float
    carbs: float
    fat: float
    ingredients: List[str]
    instructions: List[str]

class DietPlanCreate(BaseModel):
    name: str
    description: str
    calorie_target: float
    protein_target: float
    carb_target: float
    fat_target: float
    meals: List[MealCreate]

class ProgressEntryCreate(BaseModel):
    weight: Optional[float] = None
    body_fat: Optional[float] = None
    muscle_mass: Optional[float] = None
    measurements: Optional[dict] = None
    mood: Optional[str] = None
    notes: Optional[str] = None
