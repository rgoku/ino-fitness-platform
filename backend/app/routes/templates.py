"""
Workout Templates API Routes
Handles creating, browsing, duplicating, and assigning workout programs.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from app.database import get_db
from app.schemas import (
    WorkoutTemplate,
    WorkoutTemplateCreate,
    WorkoutTemplateUpdate,
    TemplateExercise,
    TemplateExerciseCreate,
)
from app.models import (
    User,
    WorkoutTemplate as WorkoutTemplateModel,
    TemplateExercise as TemplateExerciseModel,
    Workout,
    WorkoutExercise,
)
from app.auth import get_current_user

router = APIRouter(prefix="/templates", tags=["workout-templates"])
logger = logging.getLogger(__name__)


# ============================================================================
# POST /api/templates - Create new program
# ============================================================================


@router.post("", response_model=WorkoutTemplate, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: WorkoutTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new workout template.

    Args:
        template_data: Template details (name, description, weeks, days_per_week)
        current_user: Authenticated trainer
        db: Database session

    Returns:
        Created template
    """
    try:
        # Create template
        new_template = WorkoutTemplateModel(
            id=str(uuid.uuid4()),
            trainer_id=current_user.id,
            name=template_data.name,
            description=template_data.description,
            weeks=template_data.weeks,
            days_per_week=template_data.days_per_week,
            thumbnail_url=template_data.thumbnail_url,
            is_public=template_data.is_public or False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_template)
        db.commit()
        db.refresh(new_template)

        return new_template

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create template",
        )


# ============================================================================
# GET /api/templates - Browse public + your templates
# ============================================================================


@router.get("", response_model=List[WorkoutTemplate])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
):
    """
    Get templates (public + user's own).

    Args:
        current_user: Authenticated user
        db: Database session
        skip: Pagination offset
        limit: Pagination limit

    Returns:
        List of templates
    """
    try:
        # Get public templates + user's own templates
        templates = (
            db.query(WorkoutTemplateModel)
            .filter(
                (WorkoutTemplateModel.is_public == True)  # noqa: E712
                | (WorkoutTemplateModel.trainer_id == current_user.id)
            )
            .order_by(WorkoutTemplateModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return templates

    except Exception as e:
        logger.error(f"Error listing templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve templates",
        )


# ============================================================================
# POST /api/templates/{id}/duplicate - Copy/paste entire program
# ============================================================================


@router.post("/{template_id}/duplicate", response_model=WorkoutTemplate)
async def duplicate_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Duplicate a template with all exercises.

    Args:
        template_id: ID of template to duplicate
        current_user: Authenticated trainer
        db: Database session

    Returns:
        New duplicated template
    """
    try:
        # Get original template
        original = db.query(WorkoutTemplateModel).filter_by(id=template_id).first()

        if not original:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
            )

        # Check if user has permission (public or owner)
        if not original.is_public and original.trainer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot duplicate this template",
            )

        # Create duplicate
        new_id = str(uuid.uuid4())
        new_template = WorkoutTemplateModel(
            id=new_id,
            trainer_id=current_user.id,
            name=f"{original.name} (Copy)",
            description=original.description,
            weeks=original.weeks,
            days_per_week=original.days_per_week,
            thumbnail_url=original.thumbnail_url,
            is_public=False,  # New copies are private by default
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_template)
        db.flush()

        # Duplicate exercises
        original_exercises = (
            db.query(TemplateExerciseModel)
            .filter_by(template_id=template_id)
            .order_by(TemplateExerciseModel.order_index)
            .all()
        )

        for ex in original_exercises:
            new_exercise = TemplateExerciseModel(
                id=str(uuid.uuid4()),
                template_id=new_id,
                exercise_name=ex.exercise_name,
                sets=ex.sets,
                reps=ex.reps,
                rest_seconds=ex.rest_seconds,
                notes=ex.notes,
                order_index=ex.order_index,
                created_at=datetime.utcnow(),
            )
            db.add(new_exercise)

        db.commit()
        db.refresh(new_template)

        logger.info(f"Template {template_id} duplicated to {new_id}")
        return new_template

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error duplicating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to duplicate template",
        )


# ============================================================================
# PUT /api/templates/{id}/exercises - Drag to reorder, edit sets/reps/rest
# ============================================================================


@router.put("/{template_id}/exercises", response_model=List[TemplateExercise])
async def update_template_exercises(
    template_id: str,
    exercises: List[TemplateExerciseCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update exercises in a template (reorder, edit sets/reps/rest).

    Args:
        template_id: ID of template
        exercises: List of exercises with updated order/values
        current_user: Authenticated trainer
        db: Database session

    Returns:
        Updated exercises
    """
    try:
        # Get template and verify ownership
        template = db.query(WorkoutTemplateModel).filter_by(id=template_id).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
            )

        if template.trainer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot edit this template",
            )

        # Delete existing exercises
        db.query(TemplateExerciseModel).filter_by(template_id=template_id).delete()

        # Create new exercises with updated order
        new_exercises = []
        for idx, ex_data in enumerate(exercises):
            new_exercise = TemplateExerciseModel(
                id=str(uuid.uuid4()),
                template_id=template_id,
                exercise_name=ex_data.exercise_name,
                sets=ex_data.sets,
                reps=ex_data.reps,
                rest_seconds=ex_data.rest_seconds,
                notes=ex_data.notes,
                order_index=idx,
                created_at=datetime.utcnow(),
            )
            db.add(new_exercise)
            new_exercises.append(new_exercise)

        # Update template timestamp
        template.updated_at = datetime.utcnow()

        db.commit()

        logger.info(f"Template {template_id} exercises updated ({len(new_exercises)} total)")
        return new_exercises

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating template exercises: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update exercises",
        )


# ============================================================================
# POST /api/templates/{id}/assign - Assign to client with start date
# ============================================================================


@router.post("/{template_id}/assign", status_code=status.HTTP_201_CREATED)
async def assign_template_to_client(
    template_id: str,
    client_id: str,
    start_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Assign a template to a client (creates actual Workout records).

    Args:
        template_id: ID of template to assign
        client_id: ID of client to assign to
        start_date: Optional start date (ISO format). Defaults to today
        current_user: Authenticated trainer
        db: Database session

    Returns:
        Created workouts
    """
    try:
        # Get template
        template = db.query(WorkoutTemplateModel).filter_by(id=template_id).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
            )

        # Verify trainer ownership
        if template.trainer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot assign this template",
            )

        # Parse start date
        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Use ISO format (YYYY-MM-DD)",
                )
        else:
            start = datetime.utcnow()

        # Get template exercises
        template_exercises = (
            db.query(TemplateExerciseModel)
            .filter_by(template_id=template_id)
            .order_by(TemplateExerciseModel.order_index)
            .all()
        )

        if not template_exercises:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template has no exercises",
            )

        # Create workout for each day of template
        created_workouts = []
        for week in range(1, template.weeks + 1):
            for day in range(1, template.days_per_week + 1):
                # Create workout
                workout = Workout(
                    id=str(uuid.uuid4()),
                    client_id=client_id,
                    trainer_id=current_user.id,
                    name=f"Week {week}, Day {day}",
                    week=week,
                    day=day,
                    notes=template.description,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                db.add(workout)
                db.flush()

                # Add exercises from template
                for ex in template_exercises:
                    workout_exercise = WorkoutExercise(
                        id=str(uuid.uuid4()),
                        workout_id=workout.id,
                        exercise_name=ex.exercise_name,
                        sets=ex.sets,
                        reps=ex.reps,
                        rpe=None,  # Can be set manually later
                        rest=f"{ex.rest_seconds}s" if ex.rest_seconds else None,
                        video_url=None,
                        notes=ex.notes,
                        order_index=ex.order_index,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                    db.add(workout_exercise)

                created_workouts.append(workout)

        db.commit()

        logger.info(
            f"Template {template_id} assigned to client {client_id} "
            f"({len(created_workouts)} workouts created)"
        )

        return {
            "message": "Template assigned successfully",
            "workouts_created": len(created_workouts),
            "weeks": template.weeks,
            "days_per_week": template.days_per_week,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign template",
        )


# ============================================================================
# GET /api/templates/{id} - Get template details with exercises
# ============================================================================


@router.get("/{template_id}", response_model=dict)
async def get_template_details(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get full template details including exercises.

    Args:
        template_id: ID of template
        current_user: Authenticated user
        db: Database session

    Returns:
        Template with exercises
    """
    try:
        template = db.query(WorkoutTemplateModel).filter_by(id=template_id).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
            )

        # Check access
        if not template.is_public and template.trainer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view this template",
            )

        exercises = (
            db.query(TemplateExerciseModel)
            .filter_by(template_id=template_id)
            .order_by(TemplateExerciseModel.order_index)
            .all()
        )

        return {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "weeks": template.weeks,
            "days_per_week": template.days_per_week,
            "thumbnail_url": template.thumbnail_url,
            "is_public": template.is_public,
            "trainer_id": template.trainer_id,
            "exercises": exercises,
            "created_at": template.created_at,
            "updated_at": template.updated_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve template",
        )


# ============================================================================
# DELETE /api/templates/{id} - Delete template and exercises
# ============================================================================


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a template and all its exercises.

    Args:
        template_id: ID of template to delete
        current_user: Authenticated trainer
        db: Database session
    """
    try:
        template = db.query(WorkoutTemplateModel).filter_by(id=template_id).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
            )

        if template.trainer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete this template",
            )

        # Delete exercises (cascade)
        db.query(TemplateExerciseModel).filter_by(template_id=template_id).delete()

        # Delete template
        db.delete(template)
        db.commit()

        logger.info(f"Template {template_id} deleted")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template",
        )
