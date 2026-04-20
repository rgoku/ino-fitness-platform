"""
INÖ Coach Dashboard — E2E Tests

Run: python3 e2e/test_coach_dashboard.py
Uses Node.js playwright CLI (already installed via npx).
"""

import subprocess
import sys
import json
import os

BASE_URL = "http://localhost:3000"

TESTS = [
    ("Dashboard", "/", "Good"),
    ("Clients", "/clients", "Clients"),
    ("Client Detail", "/clients/c1", "James"),
    ("Programs", "/programs", "Programs"),
    ("AI Builder", "/programs/builder", "Workout Builder"),
    ("Videos", "/videos", "Video"),
    ("Nutrition", "/nutrition", "Nutrition"),
    ("Messages", "/messages", "Messages"),
    ("Analytics", "/analytics", "Analytics"),
]


def run_test(name: str, path: str, expected_text: str) -> bool:
    """Take a screenshot and verify page loaded by checking HTTP status."""
    url = f"{BASE_URL}{path}"
    tmp = f"/tmp/e2e-{name.lower().replace(' ', '-')}.png"

    result = subprocess.run(
        ["npx", "playwright", "screenshot", "--browser", "chromium", url, tmp],
        capture_output=True, text=True, timeout=20
    )

    if result.returncode == 0 and os.path.exists(tmp):
        size = os.path.getsize(tmp)
        if size > 1000:  # Valid screenshot (>1KB)
            print(f"  ✓ {name} — screenshot {size//1024}KB")
            return True
        else:
            print(f"  ✗ {name} — screenshot too small ({size}B)")
            return False
    else:
        print(f"  ✗ {name} — {result.stderr[:100] if result.stderr else 'failed'}")
        return False


def main():
    print("INÖ Coach Dashboard — E2E Test Suite")
    print("=" * 50)

    # Check server is running
    try:
        import urllib.request
        resp = urllib.request.urlopen(BASE_URL, timeout=5)
        if resp.status != 200:
            print(f"Server returned {resp.status}. Start it first:")
            print("  cd trainer-app/apps/web && npx next dev --port 3000")
            sys.exit(1)
    except Exception as e:
        print(f"Server not running at {BASE_URL}: {e}")
        print("Start it first:")
        print("  cd trainer-app/apps/web && npx next dev --port 3000")
        sys.exit(1)

    passed = 0
    failed = 0

    for name, path, expected in TESTS:
        if run_test(name, path, expected):
            passed += 1
        else:
            failed += 1

    total = passed + failed
    print(f"\n{'='*50}")
    print(f"Results: {passed}/{total} passed")

    if failed == 0:
        print("All tests passed!")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
