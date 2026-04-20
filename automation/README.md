# INÖ Automation Workflows (n8n)

Automated coaching workflows powered by [n8n](https://n8n.io).

## Setup

### Option 1: Docker (Recommended)
```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your-password \
  n8nio/n8n
```

### Option 2: npx
```bash
npx n8n
```

Then open http://localhost:5678 and import the workflow JSON files below.

## MCP Integration

To give AI assistants access to n8n workflows, add n8n-mcp to your MCP config:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["-y", "n8n-mcp@latest"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Workflows

### 1. Client Inactivity Alert (`client-inactivity.json`)
- **Trigger:** Every 6 hours
- **Logic:** Query clients inactive 3+ days → Send coach push notification + email
- **API:** GET `/api/v1/coach/clients` → filter by lastActive

### 2. Weekly Progress Report (`weekly-report.json`)
- **Trigger:** Every Monday 8am
- **Logic:** For each client → aggregate weekly stats → generate AI summary → email coach
- **API:** GET `/api/v1/progress/{user_id}/stats`

### 3. Diet Plan Reminder (`diet-reminder.json`)
- **Trigger:** Daily at meal times (8am, 12pm, 6pm)
- **Logic:** Check if client logged meal → if not, send reminder push notification
- **API:** GET `/api/v1/diet/macros?date=today`

### 4. Achievement Celebration (`achievement-notify.json`)
- **Trigger:** Webhook from backend on achievement unlock
- **Logic:** Generate congratulation message → send push + in-app notification
- **API:** POST webhook → `/api/v1/ai/motivation`

### 5. Coach Daily Digest (`coach-digest.json`)
- **Trigger:** Every day 7am
- **Logic:** Aggregate: new PRs, compliance changes, flagged clients → send digest email
- **API:** Multiple endpoints aggregated

### 6. Onboarding Drip (`onboarding-drip.json`)
- **Trigger:** New client signup webhook
- **Logic:** Day 1: Welcome, Day 3: First workout tip, Day 7: Progress check, Day 14: Feedback request
- **API:** POST `/api/v1/ai/chat` for personalized messages
