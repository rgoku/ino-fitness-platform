"""Video review — real DB queries with status tracking."""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach, get_client_user, require_plan
from app.core.security import get_current_user
from app.models import Coach, Client, VideoReview

router = APIRouter()


class AnnotationInput(BaseModel):
    timestamp_ms: int
    text: str
    type: str = "correction"


class ReviewInput(BaseModel):
    status: str
    feedback: str = ""
    annotations: list[AnnotationInput] = []


@router.post("/upload", status_code=201)
async def upload_video(
    exercise_name: str,
    client: Annotated[Client, Depends(get_client_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    # In production: validate type/size, upload to S3, generate thumbnail
    expires_at = datetime.now(timezone.utc) + timedelta(days=90)
    video = VideoReview(
        client_id=client.id, coach_id=client.coach_id,
        exercise_name=exercise_name,
        video_url=f"https://cdn.inoplatform.com/videos/{file.filename}",
        s3_key=f"coaches/{client.coach_id}/videos/{file.filename}",
        expires_at=expires_at,
    )
    db.add(video)
    await db.flush()
    return {"id": str(video.id), "status": "pending", "expires_at": expires_at.isoformat()}


@router.get("/pending")
async def list_pending(
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    results = (await db.execute(
        select(VideoReview).where(VideoReview.coach_id == coach.id, VideoReview.status == "pending")
        .order_by(VideoReview.submitted_at.desc())
    )).scalars().all()
    return {"data": [
        {"id": str(v.id), "exercise_name": v.exercise_name, "thumbnail_url": v.thumbnail_url,
         "submitted_at": v.submitted_at.isoformat(), "client_id": str(v.client_id)}
        for v in results
    ]}


@router.get("/{video_id}")
async def get_video(
    video_id: str, db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[dict, Depends(get_current_user)] = None,
):
    video = (await db.execute(select(VideoReview).where(VideoReview.id == video_id))).scalar_one_or_none()
    if not video:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Video not found")
    return {
        "id": str(video.id), "exercise_name": video.exercise_name,
        "video_url": video.video_url, "status": video.status,
        "coach_feedback": video.coach_feedback, "annotations": video.annotations or [],
        "submitted_at": video.submitted_at.isoformat(),
        "expires_at": video.expires_at.isoformat(),
    }


@router.post("/{video_id}/review")
async def review_video(
    video_id: str, body: ReviewInput,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    video = (await db.execute(
        select(VideoReview).where(VideoReview.id == video_id, VideoReview.coach_id == coach.id)
    )).scalar_one_or_none()
    if not video:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Video not found")

    video.status = body.status
    video.coach_feedback = body.feedback
    video.annotations = [a.model_dump() for a in body.annotations]
    video.reviewed_at = datetime.now(timezone.utc)
    return {"reviewed": True}
