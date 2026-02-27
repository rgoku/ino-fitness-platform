"""
Tests for Redis-based per-user rate limiting: config, service, and HTTP 429.
"""
import pytest
from unittest.mock import patch, MagicMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.rate_limit_config import (
    is_premium,
    get_limit_for_resource,
    get_ai_limit,
    get_reminders_limit,
    AI_LIMIT_BASIC,
    AI_LIMIT_PREMIUM,
    REMINDERS_LIMIT_BASIC,
    REMINDERS_LIMIT_PREMIUM,
)
from app.infrastructure.redis_rate_limit import check_and_increment, _window_key, _seconds_until_next_hour


class TestRateLimitConfig:
    def test_is_premium(self):
        assert is_premium("premium") is True
        assert is_premium("premium_ai") is True
        assert is_premium("coach_pro") is True
        assert is_premium("PREMIUM") is True
        assert is_premium("free") is False
        assert is_premium("") is False
        assert is_premium(None) is False

    def test_get_ai_limit(self):
        assert get_ai_limit("basic") == AI_LIMIT_BASIC
        assert get_ai_limit("premium") == AI_LIMIT_PREMIUM

    def test_get_reminders_limit(self):
        assert get_reminders_limit("basic") == REMINDERS_LIMIT_BASIC
        assert get_reminders_limit("premium") == REMINDERS_LIMIT_PREMIUM

    def test_get_limit_for_resource(self):
        assert get_limit_for_resource("ai", "free") == AI_LIMIT_BASIC
        assert get_limit_for_resource("ai", "premium_ai") == AI_LIMIT_PREMIUM
        assert get_limit_for_resource("reminders", "free") == REMINDERS_LIMIT_BASIC
        assert get_limit_for_resource("reminders", "coach_pro") == REMINDERS_LIMIT_PREMIUM
        assert get_limit_for_resource("unknown", "free") == 0


class TestRedisRateLimitService:
    def test_window_key_format(self):
        key = _window_key("user123", "ai")
        assert key.startswith("ino:rate_limit:user123:ai:")
        assert "T" in key

    def test_seconds_until_next_hour_positive(self):
        s = _seconds_until_next_hour()
        assert 0 < s <= 3700

    @patch("app.infrastructure.redis_rate_limit._redis")
    def test_check_and_increment_allowed_under_limit(self, mock_redis):
        pipe = MagicMock()
        pipe.incr.return_value = pipe
        pipe.ttl.return_value = pipe
        pipe.execute.return_value = [5, 3600]
        mock_redis.return_value.pipeline.return_value = pipe
        allowed, current, limit, retry_after = check_and_increment(
            "user1", "ai", "free"
        )
        assert allowed is True
        assert current == 5
        assert limit == AI_LIMIT_BASIC
        assert retry_after == 0

    @patch("app.infrastructure.redis_rate_limit._redis")
    def test_check_and_increment_exceeded_returns_429_info(self, mock_redis):
        pipe = MagicMock()
        pipe.incr.return_value = pipe
        pipe.ttl.return_value = pipe
        pipe.execute.return_value = [21, 3600]
        mock_redis.return_value.pipeline.return_value = pipe
        mock_redis.return_value.expire.return_value = True
        allowed, current, limit, retry_after = check_and_increment(
            "user1", "ai", "free"
        )
        assert allowed is False
        assert current == 21
        assert limit == AI_LIMIT_BASIC
        assert retry_after > 0

    @patch("app.infrastructure.redis_rate_limit._redis")
    def test_check_and_increment_premium_higher_ai_limit(self, mock_redis):
        pipe = MagicMock()
        pipe.incr.return_value = pipe
        pipe.ttl.return_value = pipe
        pipe.execute.return_value = [50, 3600]
        mock_redis.return_value.pipeline.return_value = pipe
        allowed, current, limit, retry_after = check_and_increment(
            "user2", "ai", "premium_ai"
        )
        assert allowed is True
        assert limit == AI_LIMIT_PREMIUM


class TestRedisRateLimitMiddleware:
    @pytest.fixture
    def app(self):
        from app.main import app
        return app

    @patch("app.middleware.redis_rate_limit_middleware.check_and_increment")
    @patch("app.middleware.redis_rate_limit_middleware._get_user_tier")
    @patch("app.middleware.redis_rate_limit_middleware._get_user_id_from_token")
    def test_middleware_returns_429_when_over_limit(
        self, mock_get_user_id, mock_get_tier, mock_check, app
    ):
        mock_get_user_id.return_value = "user1"
        mock_get_tier.return_value = "free"
        mock_check.return_value = (False, 21, AI_LIMIT_BASIC, 1800)
        client = TestClient(app)
        response = client.post(
            "/api/v1/reminders",
            json={
                "title": "Test",
                "remind_at": "2025-12-31T12:00:00",
            },
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 429
        data = response.json()
        assert "detail" in data
        assert "Rate limit exceeded" in data["detail"]
        assert data["resource"] == "reminders"
        assert data["limit"] == REMINDERS_LIMIT_BASIC
        assert data["retry_after_seconds"] == 1800
        assert response.headers.get("Retry-After") == "1800"

    @patch("app.middleware.redis_rate_limit_middleware.check_and_increment")
    @patch("app.middleware.redis_rate_limit_middleware._get_user_tier")
    @patch("app.middleware.redis_rate_limit_middleware._get_user_id_from_token")
    def test_middleware_passes_when_under_limit(
        self, mock_get_user_id, mock_get_tier, mock_check, app
    ):
        mock_get_user_id.return_value = "user1"
        mock_get_tier.return_value = "free"
        mock_check.return_value = (True, 5, AI_LIMIT_BASIC, 0)
        client = TestClient(app)
        # Request will fail later (401 or validation) but we only care that we don't get 429
        response = client.post(
            "/api/v1/reminders",
            json={"title": "Test", "remind_at": "2025-12-31T12:00:00"},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code != 429

    @patch("app.middleware.redis_rate_limit_middleware.check_and_increment")
    def test_middleware_skips_when_no_auth(self, mock_check, app):
        client = TestClient(app)
        response = client.get("/api/v1/ai/motivation?user_id=u1")
        # No Authorization header -> middleware passes through; route may return 401
        mock_check.assert_not_called()
        assert response.status_code in (401, 422)
