# Reminder worker: Redis + Celery

The reminder system can run in two ways. Both can run at once; only one will process at a time (Redis lock).

## 1. Legacy (current): in-process worker

- **Where**: `app/main.py` → `start_reminder_loop()`
- **What**: Every 60 seconds, the FastAPI process runs `process_due_reminders(db)` in the same process.
- **When**: Always active when the API server is running. Leave it on until the new system is verified.

## 2. New: Redis + Celery

- **Broker / result backend**: Redis (`REDIS_URL` or `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND`)
- **Task**: `app.domain.reminders.tasks.process_due_reminders_task`
- **Schedule**: Celery Beat runs the task every 60 seconds.
- **Idempotency**: A Redis lock (`ino:reminders:process_lock`) ensures only one run (legacy or Celery) processes due reminders at a time. Lock TTL is 55s by default.
- **Retries**: On failure, the task retries up to `CELERY_REMINDER_RETRY_MAX` (default 3) with a delay of `CELERY_REMINDER_RETRY_DELAY` (default 30) seconds.
- **Logging**: Task logs `reminder_task_start`, `reminder_task_success`, `reminder_task_skipped` (lock not acquired), and `reminder_task_error` (with exception).

### Env (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis URL (broker + lock) |
| `CELERY_BROKER_URL` | same as REDIS_URL | Celery broker |
| `CELERY_RESULT_BACKEND` | same as REDIS_URL | Celery result backend |
| `CELERY_REMINDER_LOCK_TTL` | `55` | Lock TTL (seconds); should be &lt; 60 |
| `CELERY_REMINDER_RETRY_MAX` | `3` | Max retries on failure |
| `CELERY_REMINDER_RETRY_DELAY` | `30` | Seconds before each retry |

### Run Celery (new system)

1. **Redis** must be running (e.g. `redis-server` or Docker).

2. **Worker** (consumes the reminder task):

   ```bash
   cd backend
   celery -A app.infrastructure.celery_app worker -l info -Q reminders
   ```

3. **Beat** (sends the task every 60s):

   ```bash
   celery -A app.infrastructure.celery_app beat -l info
   ```

   Or run worker + beat in one process (dev only):

   ```bash
   celery -A app.infrastructure.celery_app worker -l info -Q reminders -B
   ```

### Verifying the new system

- Start Redis, then the Celery worker and beat (or worker with `-B`).
- Create a reminder that is due (e.g. `remind_at` in the past), then trigger the task (wait for beat or call the task once manually).
- Check logs for `reminder_task_success` and confirm the in-app message exists and the reminder is marked `sent=True`.
- Optionally turn off the legacy in-process worker in `app/main.py` (remove or comment `start_reminder_loop`) and confirm reminders still get processed by Celery only.

### Removing the legacy worker

When Redis + Celery are the only reminder processor:

1. In `app/main.py`, remove the `@app.on_event("startup")` block that defines `start_reminder_loop` and calls `asyncio.create_task(reminder_worker())`.
2. Ensure Celery worker and beat (or combined worker with `-B`) are run in your deployment.
