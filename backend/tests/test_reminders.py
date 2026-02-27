"""
Test suite for reminder functionality.
Mocks AIService, time, and database to validate reminder creation, generation, and sending.
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
from sqlalchemy.orm import Session

from app.infrastructure.database.models import Reminder, Message, User
from app.infrastructure.database import SessionLocal, Base, engine
from app.domain.ai import AIService

# Create test database tables
@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Create all tables for testing."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Provide a fresh database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_user(db):
    """Create a test user."""
    user = User(
        id="test_user_1",
        email="testuser@example.com",
        hashed_password="hashed",
        name="Test User"
    )
    db.add(user)
    db.commit()
    return user


@pytest.mark.asyncio
async def test_generate_reminder_message_success():
    """Test AIService.generate_reminder_message with mock Claude."""
    ai = AIService()
    
    with patch.object(ai.client.messages, 'create') as mock_create:
        mock_message = MagicMock()
        mock_message.content = [MagicMock(text="Don't forget to drink water and stay hydrated!")]
        mock_create.return_value = mock_message
        
        result = await ai.generate_reminder_message(
            user_id="user_123",
            context={"title": "Hydration", "type": "water"}
        )
        
        assert result is not None
        assert "text" in result
        assert "water" in result["text"].lower() or "hydrated" in result["text"].lower()
        mock_create.assert_called_once()


@pytest.mark.asyncio
async def test_generate_reminder_message_fallback():
    """Test AIService.generate_reminder_message fallback on error."""
    ai = AIService()
    
    with patch.object(ai.client.messages, 'create', side_effect=Exception("Claude error")):
        result = await ai.generate_reminder_message(
            user_id="user_123",
            context={"title": "Workout"}
        )
        
        assert result is not None
        assert "text" in result
        # Fallback should contain the title
        assert "Workout" in result["text"]


def test_reminder_model_creation(db, test_user):
    """Test creating a Reminder record in the database."""
    remind_time = datetime.utcnow() + timedelta(hours=1)
    
    reminder = Reminder(
        user_id=test_user.id,
        title="Morning Workout",
        message="Time for your strength session!",
        remind_at=remind_time,
        repeat="daily",
        channel="in-app",
        sent=False
    )
    
    db.add(reminder)
    db.commit()
    
    # Verify it was saved
    saved = db.query(Reminder).filter(Reminder.id == reminder.id).first()
    assert saved is not None
    assert saved.title == "Morning Workout"
    assert saved.channel == "in-app"
    assert saved.sent == False


def test_reminder_due_query(db, test_user):
    """Test querying reminders that are due to send."""
    now = datetime.utcnow()
    
    # Create reminders with different times
    past_reminder = Reminder(
        user_id=test_user.id,
        title="Past Reminder",
        message="This was due",
        remind_at=now - timedelta(minutes=5),
        sent=False
    )
    
    future_reminder = Reminder(
        user_id=test_user.id,
        title="Future Reminder",
        message="This is not due yet",
        remind_at=now + timedelta(hours=1),
        sent=False
    )
    
    db.add(past_reminder)
    db.add(future_reminder)
    db.commit()
    
    # Query due reminders
    due = db.query(Reminder).filter(Reminder.remind_at <= now, Reminder.sent == False).all()
    
    assert len(due) >= 1
    assert any(r.id == past_reminder.id for r in due)
    assert not any(r.id == future_reminder.id for r in due)


def test_reminder_marking_sent(db, test_user):
    """Test marking a reminder as sent."""
    reminder = Reminder(
        user_id=test_user.id,
        title="Test Reminder",
        message="Test message",
        remind_at=datetime.utcnow(),
        sent=False
    )
    
    db.add(reminder)
    db.commit()
    
    # Mark as sent
    reminder.sent = True
    db.commit()
    
    # Verify
    saved = db.query(Reminder).filter(Reminder.id == reminder.id).first()
    assert saved.sent == True


def test_message_creation_from_reminder(db, test_user):
    """Test creating an in-app Message from a Reminder."""
    reminder = Reminder(
        user_id=test_user.id,
        title="Hydration Check",
        message="Drink water now!",
        remind_at=datetime.utcnow(),
        sent=False
    )
    
    db.add(reminder)
    db.commit()
    
    # Simulate sending the reminder by creating a Message
    message = Message(
        user_id=reminder.user_id,
        coach_id=None,
        sender_type="ai",
        content=reminder.message,
        message_type="reminder",
        read=False
    )
    
    db.add(message)
    reminder.sent = True
    db.commit()
    
    # Verify both records exist
    saved_msg = db.query(Message).filter(Message.id == message.id).first()
    saved_rem = db.query(Reminder).filter(Reminder.id == reminder.id).first()
    
    assert saved_msg is not None
    assert saved_msg.content == "Drink water now!"
    assert saved_rem.sent == True


def test_reminder_deletion(db, test_user):
    """Test deleting a reminder."""
    reminder = Reminder(
        user_id=test_user.id,
        title="To Delete",
        message="Delete me",
        remind_at=datetime.utcnow()
    )
    
    db.add(reminder)
    db.commit()
    reminder_id = reminder.id
    
    # Delete
    db.query(Reminder).filter(Reminder.id == reminder_id).delete()
    db.commit()
    
    # Verify deleted
    deleted = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    assert deleted is None


def test_reminder_channel_options(db, test_user):
    """Test different reminder channels."""
    channels = ["in-app", "push", "email"]
    
    for ch in channels:
        reminder = Reminder(
            user_id=test_user.id,
            title=f"Test {ch}",
            message=f"Message for {ch}",
            remind_at=datetime.utcnow(),
            channel=ch
        )
        db.add(reminder)
    
    db.commit()
    
    # Verify all channels were created
    for ch in channels:
        count = db.query(Reminder).filter(Reminder.channel == ch).count()
        assert count >= 1


@pytest.mark.asyncio
async def test_ai_service_supplement_recommendation_with_mock():
    """Test AIService.get_supplement_recommendations with mocked PubMed and Claude."""
    ai = AIService()
    
    # Mock PubMed search
    async def fake_pubmed(query, max_results=2):
        return [
            {"title": "Study 1", "source": "Journal", "year": 2020, "pmid": "123"},
            {"title": "Study 2", "source": "Journal", "year": 2021, "pmid": "456"}
        ]
    
    # Mock Claude summarizer
    async def fake_summarize(name, citations):
        return {"summary": f"{name} is effective.", "evidence_level": "moderate"}
    
    with patch.object(ai, '_search_pubmed_research', side_effect=fake_pubmed):
        with patch.object(ai, '_summarize_citations_with_claude', side_effect=fake_summarize):
            result = await ai.get_supplement_recommendations(
                user_id="user_123",
                goals=["strength"],
                preferences=None
            )
            
            assert "supplements" in result
            assert len(result["supplements"]) > 0
            
            # Verify each supplement has citations and evidence
            for supp in result["supplements"]:
                assert "name" in supp
                assert "citations" in supp
                assert len(supp["citations"]) > 0
                assert "evidence_level" in supp
                assert supp["evidence_level"] in ["high", "moderate", "preliminary"]
