#!/usr/bin/env python
"""
Sanity check script for INÖ Fitness Backend.
Validates imports, model definitions, and basic structure.
Run this after setup to ensure everything compiles and imports correctly.

Usage:
    python check_setup.py
"""

import sys
import os

def check_imports():
    """Check that all critical modules can be imported."""
    print("Checking imports...")
    
    errors = []
    
    # Check core FastAPI and SQLAlchemy
    try:
        import fastapi
        print("  ✓ fastapi")
    except ImportError as e:
        errors.append(f"FastAPI: {e}")
    
    try:
        import sqlalchemy
        print("  ✓ sqlalchemy")
    except ImportError as e:
        errors.append(f"SQLAlchemy: {e}")
    
    try:
        import anthropic
        print("  ✓ anthropic (Claude)")
    except ImportError as e:
        errors.append(f"Anthropic: {e}")
    
    try:
        import pytest
        print("  ✓ pytest")
    except ImportError as e:
        errors.append(f"Pytest: {e}")
    
    try:
        import alembic
        print("  ✓ alembic")
    except ImportError as e:
        errors.append(f"Alembic: {e}")
    
    # Try importing app modules
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    
    try:
        from app.models import User, Reminder, DietPlan, Message, Meal
        print("  ✓ app.models (User, Reminder, DietPlan, Message, Meal)")
    except ImportError as e:
        errors.append(f"app.models: {e}")
    
    try:
        from app.ai_service import AIService
        print("  ✓ app.ai_service")
    except ImportError as e:
        errors.append(f"app.ai_service: {e}")
    
    try:
        from app.notification_service import NotificationService
        print("  ✓ app.notification_service")
    except ImportError as e:
        errors.append(f"app.notification_service: {e}")
    
    try:
        from app.routes import reminders
        print("  ✓ app.routes.reminders")
    except ImportError as e:
        errors.append(f"app.routes.reminders: {e}")
    
    return errors


def check_files():
    """Check that all critical files exist."""
    print("\nChecking files...")
    
    files_to_check = [
        "backend/alembic.ini",
        "backend/alembic/env.py",
        "backend/alembic/versions/001_add_reminders_and_supplements.py",
        "backend/app/models.py",
        "backend/app/ai_service.py",
        "backend/app/notification_service.py",
        "backend/app/routes/reminders.py",
        "backend/tests/test_reminders.py",
        "backend/tests/test_notifications.py",
        "backend/main.py",
        "backend/requirements.txt",
        "coach-portal/trainers.html",
        ".env.example",
        "SETUP_AND_TESTING.md"
    ]
    
    errors = []
    base_dir = os.path.dirname(__file__)
    
    for file_path in files_to_check:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            print(f"  ✓ {file_path}")
        else:
            errors.append(f"Missing: {file_path}")
    
    return errors


def check_models():
    """Check that Reminder model has required fields."""
    print("\nChecking models...")
    
    errors = []
    
    try:
        from app.models import Reminder
        from sqlalchemy.inspection import inspect
        
        # Get model columns
        mapper = inspect(Reminder)
        columns = {c.key for c in mapper.columns}
        
        required_cols = {'id', 'user_id', 'title', 'message', 'remind_at', 'channel', 'sent', 'created_at'}
        missing = required_cols - columns
        
        if missing:
            errors.append(f"Reminder model missing columns: {missing}")
        else:
            print("  ✓ Reminder model has all required columns")
    except Exception as e:
        errors.append(f"Error checking Reminder model: {e}")
    
    try:
        from app.models import DietPlan
        from sqlalchemy.inspection import inspect
        
        mapper = inspect(DietPlan)
        columns = {c.key for c in mapper.columns}
        
        if 'supplement_recommendations' in columns:
            print("  ✓ DietPlan has supplement_recommendations column")
        else:
            errors.append("DietPlan missing supplement_recommendations column")
    except Exception as e:
        errors.append(f"Error checking DietPlan model: {e}")
    
    return errors


def main():
    """Run all checks."""
    print("=" * 60)
    print("INÖ Fitness Backend - Setup Sanity Check")
    print("=" * 60)
    
    all_errors = []
    
    # Check imports
    all_errors.extend(check_imports())
    
    # Check files
    all_errors.extend(check_files())
    
    # Check models (only if imports succeeded)
    if not any("Sanity" in str(e) for e in all_errors):
        try:
            all_errors.extend(check_models())
        except Exception as e:
            all_errors.append(f"Model check failed: {e}")
    
    # Print summary
    print("\n" + "=" * 60)
    if all_errors:
        print(f"❌ {len(all_errors)} issue(s) found:")
        for error in all_errors:
            print(f"   - {error}")
        return 1
    else:
        print("✓ All checks passed! Setup is ready.")
        print("\nNext steps:")
        print("  1. Copy .env.example to .env and configure")
        print("  2. Run migrations: alembic upgrade head")
        print("  3. Run tests: pytest -v")
        print("  4. Start server: uvicorn main:app --reload")
        return 0


if __name__ == "__main__":
    sys.exit(main())
