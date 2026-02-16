"""Workout management — real DB queries with exercise CRUD."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_coach, get_client_user
from app.core.security import get_current_user
from app.models import Coach, Client, Workout, Exercise, WorkoutAssignment, ExerciseCompletion

router = APIRouter()


class ExerciseInput(BaseModel):
    name: str
    sets: int
    reps: str
    weight: float | None = None
    rest_seconds: int = 90
    notes: str = ""
    video_url: str | None = None


class WorkoutCreate(BaseModel):
    title: str
    description: str = ""
    exercises: list[ExerciseInput]
    is_template: bool = False
    tags: list[str] = []


class WorkoutAssign(BaseModel):
    client_id: str
    scheduled_date: str


# ── Coach endpoints ────────────────────────────────────────────

@router.get("/")
async def list_workouts(
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
    template_only: bool = Query(False),
):
    query = select(Workout).where(Workout.coach_id == coach.id).options(selectinload(Workout.exercises))
    if template_only:
        query = query.where(Workout.is_template == True)
    query = query.order_by(Workout.updated_at.desc())
    results = (await db.execute(query)).scalars().all()
    return {"data": [_serialize_workout(w) for w in results]}


@router.post("/", status_code=201)
async def create_workout(
    body: WorkoutCreate,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workout = Workout(
        coach_id=coach.id, title=body.title, description=body.description,
        is_template=body.is_template, tags=body.tags,
    )
    db.add(workout)
    await db.flush()

    for i, ex in enumerate(body.exercises):
        db.add(Exercise(
            workout_id=workout.id, position=i, name=ex.name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight,
            rest_seconds=ex.rest_seconds, notes=ex.notes, video_url=ex.video_url,
        ))

    return {"id": str(workout.id)}


@router.get("/{workout_id}")
async def get_workout(
    workout_id: str, db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[dict, Depends(get_current_user)] = None,
):
    result = await db.execute(
        select(Workout).where(Workout.id == workout_id).options(selectinload(Workout.exercises))
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workout not found")
    return _serialize_workout(workout)


@router.put("/{workout_id}")
async def update_workout(
    workout_id: str, body: WorkoutCreate,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Workout).where(Workout.id == workout_id, Workout.coach_id == coach.id)
        .options(selectinload(Workout.exercises))
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workout not found")

    workout.title = body.title
    workout.description = body.description
    workout.is_template = body.is_template
    workout.tags = body.tags

    # Replace exercises
    for ex in workout.exercises:
        await db.delete(ex)
    await db.flush()

    for i, ex in enumerate(body.exercises):
        db.add(Exercise(
            workout_id=workout.id, position=i, name=ex.name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight,
            rest_seconds=ex.rest_seconds, notes=ex.notes, video_url=ex.video_url,
        ))
    return {"id": str(workout.id), "updated": True}


@router.delete("/{workout_id}", status_code=204)
async def delete_workout(
    workout_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Workout).where(Workout.id == workout_id, Workout.coach_id == coach.id))
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workout not found")
    await db.delete(workout)
    return None


@router.post("/{workout_id}/assign")
async def assign_workout(
    workout_id: str, body: WorkoutAssign,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Verify workout belongs to coach
    workout = (await db.execute(select(Workout).where(Workout.id == workout_id, Workout.coach_id == coach.id))).scalar_one_or_none()
    if not workout:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workout not found")

    # Verify client belongs to coach
    client = (await db.execute(select(Client).where(Client.id == body.client_id, Client.coach_id == coach.id))).scalar_one_or_none()
    if not client:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")

    assignment = WorkoutAssignment(
        workout_id=workout.id, client_id=client.id,
        scheduled_date=body.scheduled_date,
    )
    db.add(assignment)
    await db.flush()
    return {"id": str(assignment.id), "assigned": True}


# ── Client endpoints ───────────────────────────────────────────

@router.get("/assigned/me")
async def my_workouts(
    client: Annotated[Client, Depends(get_client_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = (
        select(WorkoutAssignment)
        .where(WorkoutAssignment.client_id == client.id)
        .options(selectinload(WorkoutAssignment.workout).selectinload(Workout.exercises))
        .order_by(WorkoutAssignment.scheduled_date.desc())
        .limit(20)
    )
    assignments = (await db.execute(query)).scalars().all()
    return {"data": [
        {
            "id": str(a.id),
            "scheduled_date": a.scheduled_date.isoformat(),
            "completed_at": a.completed_at.isoformat() if a.completed_at else None,
            "workout": _serialize_workout(a.workout),
        }
        for a in assignments
    ]}


@router.post("/{workout_id}/exercises/{exercise_id}/complete")
async def complete_exercise(
    workout_id: str, exercise_id: str,
    client: Annotated[Client, Depends(get_client_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Find the active assignment
    assignment = (await db.execute(
        select(WorkoutAssignment).where(
            WorkoutAssignment.workout_id == workout_id,
            WorkoutAssignment.client_id == client.id,
            WorkoutAssignment.completed_at.is_(None),
        ).order_by(WorkoutAssignment.scheduled_date.desc()).limit(1)
    )).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active assignment found")

    completion = ExerciseCompletion(
        assignment_id=assignment.id, exercise_id=exercise_id,
        actual_sets=0, actual_reps=0,   # client fills via request body in production
    )
    db.add(completion)
    return {"completed": True}


# ── Serialization ──────────────────────────────────────────────

def _serialize_workout(w: Workout) -> dict:
    return {
        "id": str(w.id), "title": w.title, "description": w.description,
        "is_template": w.is_template, "tags": w.tags or [],
        "exercises": [
            {"id": str(e.id), "name": e.name, "sets": e.sets, "reps": e.reps,
             "weight": e.weight, "rest_seconds": e.rest_seconds, "notes": e.notes}
            for e in (w.exercises or [])
        ],
    }
