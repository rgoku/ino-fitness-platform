# INÖ Platform — API Reference

Base URL: `https://api.inoplatform.com/v1`

All endpoints except `/auth/signup`, `/auth/login`, `/billing/plans`, and `/billing/webhook` require a Bearer token.

---

## Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Create account | — |
| POST | `/auth/login` | Get tokens | — |
| POST | `/auth/refresh` | Refresh access token | — |
| GET | `/auth/me` | Current user profile | ✓ |

### POST `/auth/signup`
```json
{ "email": "coach@example.com", "password": "...", "name": "Sarah M.", "role": "coach" }
```
→ `201` `{ "access_token": "...", "refresh_token": "...", "expires_in": 1800 }`

---

## Coaches

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/coaches/me` | Coach profile | Coach |
| PATCH | `/coaches/me` | Update profile | Coach |
| GET | `/coaches/me/stats` | Dashboard stats | Coach |
| GET | `/coaches/me/team` | Team members | Coach (Scale) |
| POST | `/coaches/me/team/invite` | Invite team member | Coach (Scale) |

### GET `/coaches/me/stats`
→ `200`
```json
{
  "active_clients": 47,
  "avg_adherence": 82,
  "retention_rate": 94,
  "at_risk_count": 3,
  "pending_video_reviews": 5,
  "monthly_revenue": 1175000,
  "revenue_change": 18
}
```

---

## Clients

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/clients/` | List clients (filterable) | Coach |
| POST | `/clients/` | Invite new client | Coach |
| GET | `/clients/{id}` | Client detail | Coach |
| PATCH | `/clients/{id}` | Update status/notes | Coach |
| GET | `/clients/{id}/risk-flags` | Active risk flags | Coach |
| POST | `/clients/{id}/risk-flags/{flag_id}/resolve` | Resolve flag | Coach |

### Query Parameters for `GET /clients/`
- `status` — filter by `active`, `at_risk`, `paused`, `churned`
- `page` — page number (default: 1)
- `page_size` — results per page (default: 20, max: 100)

---

## Workouts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/workouts/` | List workouts | Coach |
| POST | `/workouts/` | Create workout | Coach |
| GET | `/workouts/{id}` | Workout detail | Coach/Client |
| PUT | `/workouts/{id}` | Update workout | Coach |
| DELETE | `/workouts/{id}` | Delete workout | Coach |
| POST | `/workouts/{id}/assign` | Assign to client | Coach |
| GET | `/workouts/assigned/me` | My assignments | Client |
| POST | `/workouts/{id}/exercises/{eid}/complete` | Complete exercise | Client |

### POST `/workouts/`
```json
{
  "title": "Push Day",
  "description": "Chest, shoulders & triceps",
  "exercises": [
    { "name": "Bench Press", "sets": 4, "reps": "8", "rest_seconds": 120 },
    { "name": "Incline DB Press", "sets": 3, "reps": "10-12", "rest_seconds": 90 }
  ],
  "is_template": true,
  "tags": ["push", "upper"]
}
```

---

## Check-ins

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/checkins/readiness` | Submit daily readiness | Client |
| POST | `/checkins/weekly` | Submit weekly check-in | Client |
| GET | `/checkins/client/{id}` | Client's check-in history | Coach |
| POST | `/checkins/{id}/review` | Add coach notes | Coach |

### POST `/checkins/readiness`
```json
{ "sleep_quality": 4, "energy_level": 3, "stress_level": 2, "soreness": 3, "notes": "Feeling good" }
```
→ `201` `{ "id": "...", "readiness_score": 72 }`

### Readiness Score Formula
```
score = (sleep * 0.3 + energy * 0.3 + (5-stress) * 0.2 + (5-soreness) * 0.2) / 4 * 100
```

---

## Videos

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/videos/upload` | Upload form check video | Client |
| GET | `/videos/pending` | Pending reviews | Coach (Pro+) |
| GET | `/videos/{id}` | Video detail | Coach/Client |
| POST | `/videos/{id}/review` | Submit review + annotations | Coach (Pro+) |

### POST `/videos/{id}/review`
```json
{
  "status": "approved",
  "feedback": "Great depth on the squat. Watch your knee tracking.",
  "annotations": [
    { "timestamp_ms": 3200, "text": "Knees caving slightly here", "type": "correction" },
    { "timestamp_ms": 8100, "text": "Perfect depth", "type": "praise" }
  ]
}
```

---

## Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/messages/conversations` | List conversations | ✓ |
| GET | `/messages/conversations/{uid}` | Message history | ✓ |
| POST | `/messages/send` | Send message | ✓ |
| POST | `/messages/conversations/{uid}/read` | Mark as read | ✓ |

---

## Automation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/automation/rules` | List rules | Coach (Pro+) |
| POST | `/automation/rules` | Create rule | Coach (Pro+) |
| PUT | `/automation/rules/{id}` | Update rule | Coach (Pro+) |
| DELETE | `/automation/rules/{id}` | Delete rule | Coach (Pro+) |
| POST | `/automation/rules/{id}/toggle` | Enable/disable | Coach (Pro+) |
| GET | `/automation/rules/{id}/log` | Execution history | Coach (Pro+) |

### POST `/automation/rules`
```json
{
  "name": "Re-engage inactive clients",
  "trigger": { "type": "missed_workouts", "value": 2 },
  "actions": [
    { "type": "send_message", "config": { "template_id": "check_in_gentle" } },
    { "type": "flag_coach", "config": { "severity": "medium" } }
  ],
  "delay_minutes": 2880
}
```

---

## Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/billing/plans` | Available plans + pricing | — |
| POST | `/billing/checkout` | Create Stripe session | Coach |
| GET | `/billing/subscription` | Current subscription | Coach |
| POST | `/billing/subscription/update` | Change plan | Coach |
| POST | `/billing/subscription/cancel` | Cancel at period end | Coach |
| POST | `/billing/webhook` | Stripe webhooks | — (sig verified) |

---

## Error Format

All errors return:
```json
{ "code": "PLAN_LIMIT_REACHED", "message": "Your Starter plan supports up to 20 clients.", "details": {} }
```

Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `PLAN_LIMIT_REACHED`, `VALIDATION_ERROR`, `RATE_LIMITED`

---

## Rate Limits

| Tier | Requests/min | WebSocket connections |
|------|-------------|----------------------|
| Starter | 60 | 2 |
| Pro | 120 | 5 |
| Scale | 300 | 20 |
