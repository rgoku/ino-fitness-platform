# INÖ Security Architecture

## Layers Implemented

### 1. Authentication (backend/app/core/jwt.py)
- JWT access tokens: 15-min expiry, HS256
- Refresh tokens: 7-day, rotated on every use
- Token stored in HTTP-only cookies (frontend)
- `revoke_all_refresh_tokens()` for logout-everywhere

### 2. Brute Force Protection (middleware/security.py)
- 5 failed logins → IP blocked for 15 min
- Auto-unblock after expiry
- Per-IP tracking

### 3. Input Sanitization (middleware/security.py)
- SQL injection pattern detection
- XSS script tag blocking
- Path traversal blocking
- Command injection blocking
- Applied to all query params and URL paths

### 4. Secure Headers (middleware/security.py)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy (script/style/img/connect)
- Permissions-Policy (camera/mic/geo denied)
- Server header stripped

### 5. File Upload Security (middleware/security.py)
- MIME type whitelist (images, video, PDF only)
- Magic byte verification (not just extension)
- 50MB size limit
- Embedded script detection
- UUID-based safe filename generation

### 6. AI Endpoint Protection (middleware/security.py)
- Daily quota per user tier (free=5, starter=20, pro=100, scale=500)
- Prompt injection sanitization (filters dangerous patterns)
- 4000-char prompt length limit
- API key never exposed to client

### 7. Rate Limiting
- Global: 30 req/s per IP (nginx)
- Auth: 5 req/min per IP (nginx + middleware)
- AI: 2 req/min per IP (nginx) + daily quota (app)
- Redis per-user limits (middleware)

### 8. Network (nginx.conf)
- TLS 1.3 only
- HTTP → HTTPS redirect
- Server tokens hidden
- Attack path blocking (.env, .sql, .log, .bak)
- Body size + timeout limits

### 9. Database
- SQLAlchemy ORM = parameterized queries only
- No raw SQL concatenation anywhere
- Row-level security policies (Supabase)
- Encrypted at rest (Supabase default)

### 10. Frontend
- CSRF via SameSite cookies
- No secrets in client bundle
- Auth token in HTTP-only cookie + localStorage
- Route protection middleware (Next.js)

## Checklist
- [x] JWT with short expiry
- [x] Refresh token rotation
- [x] Brute force protection
- [x] SQL/XSS/command injection blocking
- [x] Secure HTTP headers
- [x] File upload validation (magic bytes)
- [x] AI quota + prompt sanitization
- [x] Rate limiting (3 tiers)
- [x] TLS 1.3 + HSTS
- [x] Server info hidden
- [x] Request logging
- [x] Parameterized queries
- [x] Nginx hardened config
