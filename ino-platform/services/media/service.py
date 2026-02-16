"""
INÖ Media Service
Handles file uploads to S3, video thumbnail generation,
and 90-day rolling retention cleanup.
"""
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class UploadResult:
    key: str
    url: str
    thumbnail_url: str | None
    size_bytes: int
    content_type: str
    expires_at: str | None


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024      # 10 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024     # 200 MB


def generate_key(coach_id: str, category: str, extension: str) -> str:
    """Generate S3 key: coaches/{id}/{category}/{uuid}.{ext}"""
    return f"coaches/{coach_id}/{category}/{uuid.uuid4().hex}.{extension}"


async def upload_image(
    coach_id: str,
    file_bytes: bytes,
    content_type: str,
    category: str = "photos",
) -> UploadResult:
    """Upload a progress photo or profile image to S3."""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Unsupported image type: {content_type}")
    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise ValueError("Image exceeds 10 MB limit")

    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = generate_key(coach_id, category, ext)

    # TODO: s3.put_object(Bucket=bucket, Key=key, Body=file_bytes, ContentType=content_type)
    url = f"https://cdn.inoplatform.com/{key}"
    return UploadResult(key=key, url=url, thumbnail_url=None, size_bytes=len(file_bytes), content_type=content_type, expires_at=None)


async def upload_video(
    coach_id: str,
    file_bytes: bytes,
    content_type: str,
    retention_days: int = 90,
) -> UploadResult:
    """Upload a form review video. Sets rolling retention expiry."""
    if content_type not in ALLOWED_VIDEO_TYPES:
        raise ValueError(f"Unsupported video type: {content_type}")
    if len(file_bytes) > MAX_VIDEO_SIZE:
        raise ValueError("Video exceeds 200 MB limit")

    key = generate_key(coach_id, "videos", "mp4")
    thumb_key = key.replace(".mp4", "_thumb.jpg")
    expires_at = (datetime.now(timezone.utc) + timedelta(days=retention_days)).isoformat()

    # TODO: upload to S3, generate thumbnail with ffmpeg, set lifecycle policy
    url = f"https://cdn.inoplatform.com/{key}"
    thumb_url = f"https://cdn.inoplatform.com/{thumb_key}"

    return UploadResult(
        key=key, url=url, thumbnail_url=thumb_url,
        size_bytes=len(file_bytes), content_type=content_type, expires_at=expires_at,
    )


async def cleanup_expired_videos() -> int:
    """Cron job: delete videos past their retention date. Returns count deleted."""
    # TODO: query DB for expired videos, delete from S3, update DB
    return 0


async def get_presigned_upload_url(coach_id: str, filename: str) -> dict:
    """Generate a presigned S3 URL for direct client upload (large files)."""
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp4"
    key = generate_key(coach_id, "videos", ext)
    # TODO: s3.generate_presigned_url('put_object', Params={...}, ExpiresIn=3600)
    return {"upload_url": f"https://s3.amazonaws.com/ino-media/{key}", "key": key}
