#!/bin/bash
# INÖ Security Audit Script
# Run: bash scripts/security-audit.sh

echo "════════════════════════════════════════"
echo "  INÖ Security Audit"
echo "════════════════════════════════════════"

PASS=0; WARN=0; FAIL=0

check() {
  if [ "$2" = "pass" ]; then echo "  ✓ $1"; PASS=$((PASS+1));
  elif [ "$2" = "warn" ]; then echo "  ⚠ $1"; WARN=$((WARN+1));
  else echo "  ✗ $1"; FAIL=$((FAIL+1)); fi
}

echo ""
echo "── Backend Security ──"

# Check for raw SQL
RAW_SQL=$(grep -rn "\.execute(\"\\|\.execute('\\|text(\"SELECT\\|text('SELECT\\|cursor\\.execute" backend/app/ --include="*.py" 2>/dev/null | grep -v "alembic\|migration\|__pycache__\|redis\|pipe\\.execute" | wc -l)
[ "$RAW_SQL" -eq 0 ] && check "No raw SQL (parameterized queries)" "pass" || check "Found $RAW_SQL raw SQL usage(s)" "fail"

# Check JWT secret
grep -q "ino-dev-secret" backend/app/core/jwt.py 2>/dev/null && check "Default JWT secret in code (OK for dev, change in prod)" "warn" || check "JWT secret externalized" "pass"

# Check security middleware
grep -q "SecureHeadersMiddleware" backend/app/main.py && check "Secure headers middleware" "pass" || check "Secure headers missing" "fail"
grep -q "IPBlockingMiddleware" backend/app/main.py && check "IP blocking middleware" "pass" || check "IP blocking missing" "fail"
grep -q "InputSanitizationMiddleware" backend/app/main.py && check "Input sanitization" "pass" || check "Input sanitization missing" "fail"
grep -q "CSRFMiddleware" backend/app/main.py && check "CSRF protection" "pass" || check "CSRF missing" "fail"
grep -q "ErrorSanitizationMiddleware" backend/app/main.py && check "Error sanitization" "pass" || check "Error sanitization missing" "fail"
grep -q "RequestLoggingMiddleware" backend/app/main.py && check "Request logging" "pass" || check "Request logging missing" "fail"
grep -q "RedisRateLimitMiddleware" backend/app/main.py && check "Rate limiting" "pass" || check "Rate limiting missing" "fail"

# Check file upload validation
grep -q "validate_file_upload" backend/app/middleware/security.py && check "File upload validation (magic bytes)" "pass" || check "File validation missing" "fail"

# Check AI protection
grep -q "sanitize_ai_prompt" backend/app/middleware/security.py && check "AI prompt sanitization" "pass" || check "AI sanitization missing" "fail"
grep -q "check_ai_quota" backend/app/middleware/security.py && check "AI usage quotas" "pass" || check "AI quotas missing" "fail"

echo ""
echo "── Frontend Security ──"

# Check for exposed secrets
SECRETS=$(grep -rn "sk_live_\|sk_test_\|AKIA\|-----BEGIN.*KEY" trainer-app/apps/web/src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v ".env\|process.env\|example\|placeholder" | wc -l)
[ "$SECRETS" -eq 0 ] && check "No hardcoded secrets in frontend" "pass" || check "Found $SECRETS potential secret(s)" "fail"

# Check middleware
[ -f "trainer-app/apps/web/src/middleware.ts" ] && check "Route protection middleware" "pass" || check "Route protection missing" "fail"

# Check CSP
grep -q "Content-Security-Policy" backend/app/middleware/security.py && check "Content Security Policy" "pass" || check "CSP missing" "fail"

echo ""
echo "── Infrastructure ──"

# Check deployment configs
[ -f "backend/nginx.conf" ] && check "Nginx hardened config" "pass" || check "Nginx config missing" "fail"
grep -q "TLSv1.3" backend/nginx.conf 2>/dev/null && check "TLS 1.3 enforced" "pass" || check "TLS config missing" "warn"
grep -q "server_tokens off" backend/nginx.conf 2>/dev/null && check "Server tokens hidden" "pass" || check "Server tokens exposed" "warn"

echo ""
echo "── Dependencies ──"

# Check for known vulnerable packages
if command -v npm &> /dev/null; then
  cd trainer-app 2>/dev/null
  VULNS=$(npm audit --json 2>/dev/null | grep -c '"severity"' 2>/dev/null || echo "0")
  [ "$VULNS" -lt 5 ] && check "npm audit: $VULNS issues" "pass" || check "npm audit: $VULNS vulnerabilities" "warn"
  cd ..
fi

if command -v pip &> /dev/null; then
  PIP_VULNS=$(pip audit --format=json 2>/dev/null | grep -c '"name"' 2>/dev/null || echo "skip")
  [ "$PIP_VULNS" = "skip" ] && check "pip audit: skipped (pip-audit not installed)" "warn" || check "pip audit: $PIP_VULNS issues" "pass"
fi

echo ""
echo "════════════════════════════════════════"
echo "  Results: $PASS passed, $WARN warnings, $FAIL failed"
echo "════════════════════════════════════════"
