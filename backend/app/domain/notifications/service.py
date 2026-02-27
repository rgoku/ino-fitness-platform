"""
Notification service abstraction for reminders.
Supports multiple channels: in-app (Messages table), push (FCM), email (SMTP).
"""
import os
from abc import ABC, abstractmethod
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()


class NotificationChannel(ABC):
    """Base notification channel interface."""

    @abstractmethod
    async def send(self, user_id: str, title: str, message: str, data: dict = None) -> dict:
        """Send notification. Returns {success: bool, message_id: str, error: str}."""
        pass


class InAppNotification(NotificationChannel):
    """In-app notification (stored as Message in database)."""

    async def send(self, user_id: str, title: str, message: str, data: dict = None) -> dict:
        return {
            "success": True,
            "channel": "in-app",
            "message": "Message created in database",
        }


class PushNotification(NotificationChannel):
    """Push notification via Firebase Cloud Messaging (FCM)."""

    def __init__(self):
        self.fcm_api_key = os.getenv("FCM_API_KEY")
        self.fcm_endpoint = "https://fcm.googleapis.com/fcm/send"

    async def send(self, user_id: str, title: str, message: str, data: dict = None) -> dict:
        if not self.fcm_api_key:
            return {
                "success": False,
                "channel": "push",
                "error": "FCM_API_KEY not configured",
            }
        try:
            import requests

            fcm_token = data.get("fcm_token") if data else None
            if not fcm_token:
                return {
                    "success": False,
                    "channel": "push",
                    "error": "No FCM token available for user",
                }
            data_payload = {
                "user_id": user_id,
                "type": data.get("type", "reminder") if data else "reminder",
            }
            if data:
                if data.get("screen"):
                    data_payload["screen"] = str(data["screen"])
                if data.get("reminder_id"):
                    data_payload["reminder_id"] = str(data["reminder_id"])
            payload = {
                "to": fcm_token,
                "notification": {
                    "title": title,
                    "body": message,
                    "sound": "default",
                    "priority": "high",
                },
                "data": data_payload,
            }
            headers = {
                "Authorization": f"key={self.fcm_api_key}",
                "Content-Type": "application/json",
            }

            def _post():
                return requests.post(
                    self.fcm_endpoint, json=payload, headers=headers, timeout=5
                )

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _post)
            if response.status_code == 200:
                return {
                    "success": True,
                    "channel": "push",
                    "message_id": response.json().get("message_id"),
                }
            return {
                "success": False,
                "channel": "push",
                "error": response.text,
            }
        except Exception as e:
            return {"success": False, "channel": "push", "error": str(e)}


class EmailNotification(NotificationChannel):
    """Email notification via SMTP."""

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")

    async def send(self, user_id: str, title: str, message: str, data: dict = None) -> dict:
        if not all([self.smtp_user, self.smtp_password]):
            return {
                "success": False,
                "channel": "email",
                "error": "SMTP credentials not configured",
            }
        try:
            recipient_email = data.get("email") if data else None
            if not recipient_email:
                return {
                    "success": False,
                    "channel": "email",
                    "error": "No email address available for user",
                }
            msg = MIMEMultipart()
            msg["From"] = self.smtp_user
            msg["To"] = recipient_email
            msg["Subject"] = f"INÖ Fitness: {title}"
            body = f"""
            <html>
              <body>
                <h2>{title}</h2>
                <p>{message}</p>
                <p style="color: #999; font-size: 12px;">
                  INÖ Fitness - Your AI Fitness Coach
                </p>
              </body>
            </html>
            """
            msg.attach(MIMEText(body, "html"))

            def send_sync():
                with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)

            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, send_sync)
            return {
                "success": True,
                "channel": "email",
                "recipient": recipient_email,
            }
        except Exception as e:
            return {"success": False, "channel": "email", "error": str(e)}


class NotificationService:
    """Main notification service orchestrator."""

    def __init__(self):
        self.channels = {
            "in-app": InAppNotification(),
            "push": PushNotification(),
            "email": EmailNotification(),
        }

    async def send(
        self, channel: str, user_id: str, title: str, message: str, data: dict = None
    ) -> dict:
        if channel not in self.channels:
            return {"success": False, "error": f"Unknown channel: {channel}"}
        notifier = self.channels[channel]
        return await notifier.send(user_id, title, message, data)

    async def send_multi(
        self, channels: list, user_id: str, title: str, message: str, data: dict = None
    ) -> dict:
        results = {}
        for ch in channels:
            result = await self.send(ch, user_id, title, message, data)
            results[ch] = result
        return results


notification_service = NotificationService()
