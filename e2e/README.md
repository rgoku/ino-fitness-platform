# INÖ E2E Tests — Browser Use

Automated end-to-end tests using [browser-use](https://github.com/browser-use/browser-use).

## Setup

```bash
pip install browser-use
# or
uv add browser-use
```

## Running Tests

```bash
# Full test suite
python e2e/test_coach_dashboard.py

# Individual tests
python e2e/test_coach_dashboard.py TestCoachDashboard.test_dashboard_loads
```

## Test Coverage

| Test | What it verifies |
|------|-----------------|
| Dashboard loads | Stats grid, attention queue, recent activity |
| Client list | Table renders, search works, status badges |
| Client detail | Tabs switch, heatmap renders, compliance bar |
| Nutrition page | Diet plan cards, evidence badges, macro rings |
| Programs page | Template cards, new program button |
| AI Builder | Exercise input parsing, build button, results |
| Video Library | Category filters, empty state, add button |
| Messages | Conversation list, thread view |
