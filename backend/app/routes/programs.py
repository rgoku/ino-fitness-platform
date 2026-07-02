"""Program save/load API — backs the coach dashboard drag-and-drop builder.

A "program" is persisted as a WorkoutTemplate plus ordered TemplateExercise rows.
The builder sends ranges as free text (reps "8-12", rest "90s", rpe "8"); we keep
the raw text losslessly while also storing a best-effort integer for structured
consumers (mobile, assignment materialization).
"""
import re
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import require_coach
from app.infrastructure.database import get_db
from app.infrastructure.database.models import (
    TemplateExercise,
    User,
    WorkoutTemplate,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ProgramExerciseIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sets: int = Field(3, ge=0, le=50)
    reps: str = Field("10", max_length=50)
    rest: Optional[str] = Field(None, max_length=50)
    rpe: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=1000)
    muscle_groups: List[str] = Field(default_factory=list)


class ProgramIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    weeks: int = Field(1, ge=1, le=52)
    days_per_week: int = Field(1, ge=1, le=14)
    is_public: bool = False
    exercises: List[ProgramExerciseIn] = Field(default_factory=list)


class ProgramExerciseOut(BaseModel):
    id: str
    name: str
    sets: int
    reps: str
    rest: Optional[str] = None
    rpe: Optional[str] = None
    notes: Optional[str] = None
    muscle_groups: List[str] = Field(default_factory=list)
    order_index: int = 0


class ProgramOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    weeks: int
    days_per_week: int
    is_public: bool
    trainer_id: Optional[str] = None
    exercise_count: int
    exercises: List[ProgramExerciseOut] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _first_int(value: Optional[str], default: int) -> int:
    """Extract the leading integer from a free-text value ('8-12' -> 8, '90s' -> 90)."""
    if value is None:
        return default
    m = re.search(r"\d+", str(value))
    return int(m.group()) if m else default


def _row_to_out(te: TemplateExercise) -> ProgramExerciseOut:
    return ProgramExerciseOut(
        id=te.id,
        name=te.exercise_name,
        sets=te.sets or 0,
        reps=te.reps_text or (str(te.reps) if te.reps is not None else "10"),
        rest=te.rest_text or (f"{te.rest_seconds}s" if te.rest_seconds else None),
        rpe=te.rpe,
        notes=te.notes,
        muscle_groups=te.muscle_groups or [],
        order_index=te.order_index or 0,
    )


def _template_to_out(t: WorkoutTemplate) -> ProgramOut:
    rows = sorted(t.exercises, key=lambda r: r.order_index or 0)
    return ProgramOut(
        id=t.id,
        name=t.name,
        description=t.description,
        weeks=t.weeks,
        days_per_week=t.days_per_week,
        is_public=bool(t.is_public),
        trainer_id=t.trainer_id,
        exercise_count=len(rows),
        exercises=[_row_to_out(r) for r in rows],
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


def _apply_exercises(db: Session, template_id: str, exercises: List[ProgramExerciseIn]) -> None:
    """Replace all exercise rows for a template with the provided ordered list."""
    db.query(TemplateExercise).filter(TemplateExercise.template_id == template_id).delete()
    for idx, ex in enumerate(exercises):
        db.add(
            TemplateExercise(
                id=str(uuid.uuid4()),
                template_id=template_id,
                exercise_name=ex.name,
                sets=ex.sets,
                reps=_first_int(ex.reps, 10),
                rest_seconds=_first_int(ex.rest, 60),
                reps_text=ex.reps,
                rest_text=ex.rest,
                rpe=ex.rpe,
                muscle_groups=ex.muscle_groups or [],
                notes=ex.notes,
                order_index=idx,
                created_at=datetime.utcnow(),
            )
        )


def _owned_template_or_404(db: Session, program_id: str, coach: User) -> WorkoutTemplate:
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == program_id).first()
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    if template.trainer_id != coach.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your program")
    return template


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("", response_model=ProgramOut, status_code=status.HTTP_201_CREATED)
def create_program(
    body: ProgramIn,
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Save a new program (drag-and-drop builder)."""
    template = WorkoutTemplate(
        id=str(uuid.uuid4()),
        trainer_id=coach.id,
        name=body.name,
        description=body.description,
        weeks=body.weeks,
        days_per_week=body.days_per_week,
        is_public=body.is_public,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(template)
    db.flush()
    _apply_exercises(db, template.id, body.exercises)
    db.commit()
    db.refresh(template)
    return _template_to_out(template)


@router.get("", response_model=List[ProgramOut])
def list_programs(
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    """List the current coach's programs (most recent first)."""
    templates = (
        db.query(WorkoutTemplate)
        .filter(WorkoutTemplate.trainer_id == coach.id)
        .order_by(WorkoutTemplate.updated_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )
    return [_template_to_out(t) for t in templates]


@router.get("/{program_id}", response_model=ProgramOut)
def get_program(
    program_id: str,
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Get one program with its ordered exercises."""
    template = _owned_template_or_404(db, program_id, coach)
    return _template_to_out(template)


@router.put("/{program_id}", response_model=ProgramOut)
def update_program(
    program_id: str,
    body: ProgramIn,
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Update a program (metadata + full exercise list)."""
    template = _owned_template_or_404(db, program_id, coach)
    template.name = body.name
    template.description = body.description
    template.weeks = body.weeks
    template.days_per_week = body.days_per_week
    template.is_public = body.is_public
    template.updated_at = datetime.utcnow()
    _apply_exercises(db, template.id, body.exercises)
    db.commit()
    db.refresh(template)
    return _template_to_out(template)


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_program(
    program_id: str,
    coach: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Delete a program and its exercises."""
    template = _owned_template_or_404(db, program_id, coach)
    db.delete(template)
    db.commit()
    return None
