"""Caching utilities with Redis fallback to memory"""
import os
import json
import hashlib
from typing import Optional, Any
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Try to use Redis, fallback to in-memory cache
cache_backend = None
try:
    import redis
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        cache_backend = redis.from_url(redis_url, decode_responses=True)
        logger.info("Redis cache initialized")
    else:
        logger.warning("REDIS_URL not set, using in-memory cache")
except Exception as e:
    logger.warning(f"Redis not available: {e}, using in-memory cache")

# Fallback in-memory cache
_memory_cache = {}
_cache_ttl = {}

def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from arguments"""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
    key_hash = hashlib.md5(key_data.encode()).hexdigest()
    return f"{prefix}:{key_hash}"

def get(key: str) -> Optional[Any]:
    """Get value from cache"""
    try:
        if cache_backend:
            value = cache_backend.get(key)
            if value:
                return json.loads(value)
        else:
            # Check memory cache
            if key in _memory_cache:
                # Check TTL
                import time
                if key in _cache_ttl and _cache_ttl[key] > time.time():
                    return _memory_cache[key]
                else:
                    # Expired
                    del _memory_cache[key]
                    if key in _cache_ttl:
                        del _cache_ttl[key]
    except Exception as e:
        logger.error(f"Cache get error: {e}")
    return None

def set(key: str, value: Any, ttl: int = 3600):
    """Set value in cache with TTL (seconds)"""
    try:
        if cache_backend:
            cache_backend.setex(key, ttl, json.dumps(value))
        else:
            # Memory cache
            import time
            _memory_cache[key] = value
            _cache_ttl[key] = time.time() + ttl
    except Exception as e:
        logger.error(f"Cache set error: {e}")

def delete(key: str):
    """Delete key from cache"""
    try:
        if cache_backend:
            cache_backend.delete(key)
        else:
            if key in _memory_cache:
                del _memory_cache[key]
            if key in _cache_ttl:
                del _cache_ttl[key]
    except Exception as e:
        logger.error(f"Cache delete error: {e}")

def cached(ttl: int = 3600, prefix: str = "cache"):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = get_cache_key(f"{prefix}:{func.__name__}", *args, **kwargs)
            
            # Try to get from cache
            cached_value = get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs) if hasattr(func, '__call__') and hasattr(func, '__code__') else func(*args, **kwargs)
            
            # Store in cache
            set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

