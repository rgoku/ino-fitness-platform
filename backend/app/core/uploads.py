"""Shared upload validation: enforce content-type and a hard size cap,
streaming in chunks so an oversized upload is rejected without being fully
buffered in memory."""
from fastapi import HTTPException, UploadFile, status

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
IMAGE_AND_VIDEO = ("image/", "video/")


async def read_validated_upload(
    file: UploadFile,
    *,
    allowed_prefixes: tuple = IMAGE_AND_VIDEO,
    max_bytes: int = MAX_UPLOAD_BYTES,
) -> bytes:
    content_type = (file.content_type or "").lower()
    if not any(content_type.startswith(p) for p in allowed_prefixes):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type or 'unknown'}'. "
                   f"Allowed: {', '.join(allowed_prefixes)}",
        )
    chunks = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed is {max_bytes // (1024 * 1024)} MB.",
            )
        chunks.append(chunk)
    if total == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file.")
    return b"".join(chunks)
