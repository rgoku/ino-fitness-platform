# 🧪 Testing Top-Tier Features

## Quick Test Scripts

### 1. Test Rate Limiting

**Backend:**
```bash
# Test auth rate limiting (should fail on 11th request)
for i in {1..12}; do
  echo "Request $i:"
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Expected:** First 10 requests return 401 (wrong password), 11th+ should return 429 (rate limited)

### 2. Test Offline Queue (Mobile)

**In React Native app:**
```typescript
import { offlineQueue } from './src/services/offlineQueue';
import { apiService } from './src/services/apiService';

// 1. Turn off network (airplane mode)
// 2. Try to log a workout
try {
  await apiService.post('/workouts/log-set', {
    exercise: 'Squat',
    reps: 5,
    weight: 225
  });
} catch (error) {
  console.log('Request queued:', error.message);
}

// 3. Check queue status
const status = offlineQueue.getQueueStatus();
console.log('Queue:', status);

// 4. Turn on network
// 5. Queue should auto-sync
```

### 3. Test Sentry Error Tracking

**Backend:**
```python
# In any route, trigger an error:
raise Exception("Test error for Sentry")
```

**Mobile:**
```typescript
import * as Sentry from '@sentry/react-native';

// Test error
Sentry.captureException(new Error('Test error'));
```

**Check:** Sentry dashboard should show the error

### 4. Test Analytics

**Mobile:**
```typescript
import { analytics } from './src/services/analytics';

// Initialize
await analytics.initialize('user123');

// Track event
analytics.track('test_event', {
  test_property: 'test_value'
});

// Check console for log
// In production, check Mixpanel/Amplitude dashboard
```

### 5. Test Social Sharing

**Mobile:**
```typescript
import { socialShare } from './src/services/socialShare';

// Share workout
await socialShare.shareWorkout({
  id: '123',
  name: 'Push Day',
  exercises: [{ name: 'Bench Press' }],
  duration: 45
});
```

**Expected:** Native share sheet should open

### 6. Test Caching

**Backend:**
```python
from app.utils.cache import get, set

# Set cache
set("test_key", {"data": "value"}, ttl=60)

# Get cache
value = get("test_key")
print(value)  # Should print: {'data': 'value'}

# Wait 61 seconds, try again
# Should return None (expired)
```

### 7. Test Error Handling

**Backend:**
```bash
# Test validation error
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"123"}'

# Should return 422 with validation details
```

**Expected:** Proper error response with request ID

## Integration Tests

### Full Workflow Test

1. **User Registration** (rate limited)
2. **Login** (rate limited)
3. **Generate Workout Plan** (cached)
4. **Log Workout** (offline queue if offline)
5. **Share Workout** (analytics tracked)
6. **Error Occurs** (Sentry captures)

## Performance Tests

### API Response Time
```bash
# Test response time
time curl http://localhost:8000/health
# Should be < 100ms
```

### Cache Hit Rate
```python
# Monitor cache hits
from app.utils.cache import get, set

# First call (cache miss)
result1 = expensive_function()  # Takes 2 seconds

# Second call (cache hit)
result2 = expensive_function()  # Takes < 10ms
```

## Monitoring

### Check Logs
```bash
# Backend logs (structured JSON)
tail -f backend.log | jq

# Mobile logs
# Check React Native debugger or console
```

### Check Queue Status
```typescript
// Mobile
import { offlineQueue } from './src/services/offlineQueue';
const status = offlineQueue.getQueueStatus();
console.log(status);
```

### Check Analytics Queue
```typescript
// Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
const queue = await AsyncStorage.getItem('analytics_queue');
console.log(JSON.parse(queue || '[]'));
```

## Expected Results

### ✅ All Tests Passing
- Rate limiting: Blocks excessive requests
- Offline queue: Queues and syncs requests
- Sentry: Captures errors
- Analytics: Tracks events
- Social sharing: Opens share sheet
- Caching: Speeds up responses
- Error handling: Returns proper errors

### ❌ Common Issues

**Rate limiting not working:**
- Check `slowapi` is installed
- Verify Redis URL (or using memory)
- Check route has `@limiter.limit()` decorator

**Offline queue not syncing:**
- Check network status
- Verify AsyncStorage permissions
- Check queue isn't full

**Sentry not reporting:**
- Verify DSN is correct
- Check environment variable
- Ensure Sentry is initialized

**Analytics not tracking:**
- Check analytics provider is configured
- Verify events are being logged
- Check offline queue for pending events

---

**Status**: Ready for Testing ✅



