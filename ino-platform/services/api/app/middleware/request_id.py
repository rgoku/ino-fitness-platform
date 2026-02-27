"""Request ID middleware — injects unique ID into every request for tracing."""
import logging
import re
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import request_id_var

logger = logging.getLogger(__name__)

# Only allow safe alphanumeric + hyphens/underscores, max 64 chars
_SAFE_REQUEST_ID_RE = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assign a unique request ID to every request, log request completion."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Validate client-provided ID to prevent log injection
        client_id = request.headers.get("X-Request-ID", "")
        if client_id and _SAFE_REQUEST_ID_RE.match(client_id):
            req_id = client_id
        else:
            req_id = f"req_{uuid.uuid4().hex[:12]}"
        request_id_var.set(req_id)

        t0 = time.monotonic()

        response = await call_next(request)

        duration_ms = round((time.monotonic() - t0) * 1000, 1)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = req_id

        # Log completed request
        logger.info(
            "request_completed",
            extra={
                "request_id": req_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
                "ip": request.client.host if request.client else "",
                "user_agent": request.headers.get("User-Agent", ""),
            },
        )

        return response
