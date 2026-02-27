"""Structured JSON logging configuration for production."""
import logging
import sys
from contextvars import ContextVar

# Context variables for request-scoped data
request_id_var: ContextVar[str] = ContextVar("request_id", default="")
user_id_var: ContextVar[str] = ContextVar("user_id", default="")
coach_id_var: ContextVar[str] = ContextVar("coach_id", default="")


class JSONFormatter(logging.Formatter):
    """Format log records as single-line JSON for CloudWatch/Loki ingestion."""

    def format(self, record: logging.LogRecord) -> str:
        import json
        from datetime import datetime, timezone

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "logger": record.name,
            "event": record.getMessage(),
            "request_id": request_id_var.get(""),
            "user_id": user_id_var.get(""),
            "coach_id": coach_id_var.get(""),
        }

        # Include extra fields if provided
        if hasattr(record, "__dict__"):
            for key in ("method", "path", "status", "duration_ms", "ip",
                        "user_agent", "plan_tier", "trace_id", "error"):
                if key in record.__dict__:
                    log_entry[key] = record.__dict__[key]

        # Include exception info
        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)


def setup_logging(debug: bool = False) -> None:
    """Configure application logging."""
    level = logging.DEBUG if debug else logging.INFO

    # Root logger
    root = logging.getLogger()
    root.setLevel(level)

    # Clear existing handlers
    root.handlers.clear()

    # JSON handler for stdout (captured by ECS → CloudWatch)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root.addHandler(handler)

    # Reduce noise from libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("celery").setLevel(logging.INFO)
    logging.getLogger("stripe").setLevel(logging.WARNING)
