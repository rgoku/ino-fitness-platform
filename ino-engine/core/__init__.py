"""
ino-engine.core
---------------
Core geometry, engine loop, and self-test utilities.
"""
from .angle_calculator import *          # noqa: F401,F403

def run(*args, **kwargs):                # lazy import to avoid circular deps
    from .main_engine import run as _run  # noqa: F811
    return _run(*args, **kwargs)
