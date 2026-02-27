"""
Tests for notification service (push, email, in-app channels).
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.notification_service import (
    NotificationService,
    InAppNotification,
    PushNotification,
    EmailNotification
)


@pytest.mark.asyncio
async def test_in_app_notification():
    """Test in-app notification channel."""
    notif = InAppNotification()
    result = await notif.send("user_123", "Test Title", "Test message")
    
    assert result["success"] == True
    assert result["channel"] == "in-app"


@pytest.mark.asyncio
async def test_push_notification_missing_config():
    """Test push notification without FCM config."""
    with patch.dict('os.environ', {'FCM_API_KEY': ''}):
        notif = PushNotification()
        result = await notif.send("user_123", "Title", "Message")
        
        assert result["success"] == False
        assert "not configured" in result["error"]


@pytest.mark.asyncio
async def test_push_notification_no_token():
    """Test push notification without user FCM token."""
    with patch.dict('os.environ', {'FCM_API_KEY': 'test_key'}):
        notif = PushNotification()
        result = await notif.send("user_123", "Title", "Message", data={})
        
        assert result["success"] == False
        assert "No FCM token" in result["error"]


@pytest.mark.asyncio
async def test_push_notification_success():
    """Test successful push notification."""
    with patch.dict('os.environ', {'FCM_API_KEY': 'test_key'}):
        notif = PushNotification()
        
        # Mock the requests.post call
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"message_id": "msg_123"}
        
        with patch('app.domain.notifications.service.requests.post', return_value=mock_response):
            result = await notif.send(
                "user_123",
                "Workout Reminder",
                "Time to workout!",
                data={"fcm_token": "token_xyz"}
            )
            
            assert result["success"] == True
            assert result["channel"] == "push"
            assert result["message_id"] == "msg_123"


@pytest.mark.asyncio
async def test_email_notification_missing_config():
    """Test email notification without SMTP config."""
    with patch.dict('os.environ', {'SMTP_USER': '', 'SMTP_PASSWORD': ''}):
        notif = EmailNotification()
        result = await notif.send("user_123", "Title", "Message")
        
        assert result["success"] == False
        assert "not configured" in result["error"]


@pytest.mark.asyncio
async def test_email_notification_no_email():
    """Test email notification without recipient email."""
    with patch.dict('os.environ', {'SMTP_USER': 'test@example.com', 'SMTP_PASSWORD': 'pass'}):
        notif = EmailNotification()
        result = await notif.send("user_123", "Title", "Message", data={})
        
        assert result["success"] == False
        assert "No email" in result["error"]


@pytest.mark.asyncio
async def test_email_notification_success():
    """Test successful email notification."""
    with patch.dict('os.environ', {
        'SMTP_SERVER': 'smtp.test.com',
        'SMTP_PORT': '587',
        'SMTP_USER': 'test@example.com',
        'SMTP_PASSWORD': 'password'
    }):
        notif = EmailNotification()
        
        with patch('smtplib.SMTP'):
            result = await notif.send(
                "user_123",
                "Hydration Reminder",
                "Drink water!",
                data={"email": "user@example.com"}
            )
            
            assert result["success"] == True
            assert result["channel"] == "email"


@pytest.mark.asyncio
async def test_notification_service_single_channel():
    """Test NotificationService sending to single channel."""
    service = NotificationService()
    
    result = await service.send("in-app", "user_123", "Title", "Message")
    assert result["success"] == True
    assert result["channel"] == "in-app"


@pytest.mark.asyncio
async def test_notification_service_unknown_channel():
    """Test NotificationService with unknown channel."""
    service = NotificationService()
    
    result = await service.send("unknown_channel", "user_123", "Title", "Message")
    assert result["success"] == False
    assert "Unknown channel" in result["error"]


@pytest.mark.asyncio
async def test_notification_service_multi_channel():
    """Test NotificationService sending to multiple channels."""
    service = NotificationService()
    
    result = await service.send_multi(
        ["in-app", "push"],
        "user_123",
        "Multi Channel Test",
        "Message",
        data={"fcm_token": ""}
    )
    
    assert "in-app" in result
    assert "push" in result
    assert result["in-app"]["success"] == True
