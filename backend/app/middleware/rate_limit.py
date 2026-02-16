"""Rate limiting middleware for API protection"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
import os

# Initialize rate limiter
# Note: For production, use Redis: storage_uri="redis://localhost:6379/0"
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000/hour"],  # Default: 1000 requests per hour per IP
    storage_uri=os.getenv("REDIS_URL", "memory://")  # Use Redis if available, else memory
)

# Rate limit configurations per endpoint
RATE_LIMITS = {
    "auth": "10/minute",  # Login/signup: 10 per minute
    "ai": "30/hour",  # AI features: 30 per hour (expensive)
    "form_check": "20/hour",  # Form checking: 20 per hour
    "meal_analysis": "50/hour",  # Meal analysis: 50 per hour
    "default": "200/hour",  # Default: 200 per hour
}

def get_rate_limit_for_endpoint(endpoint: str) -> str:
    """Get rate limit string for an endpoint"""
    if "auth" in endpoint.lower() or "login" in endpoint.lower() or "signup" in endpoint.lower():
        return RATE_LIMITS["auth"]
    elif "ai" in endpoint.lower() or "chat" in endpoint.lower():
        return RATE_LIMITS["ai"]
    elif "form" in endpoint.lower() or "video" in endpoint.lower():
        return RATE_LIMITS["form_check"]
    elif "meal" in endpoint.lower() or "food" in endpoint.lower():
        return RATE_LIMITS["meal_analysis"]
    return RATE_LIMITS["default"]

