# Review 03 — 인증 방식 Bearer 전환 (1차)

**대상**: config.ts, context.ts, admin.ts, index.ts, admin-session.ts  
**결과**: FAIL → 수정 후 PASS

## FAIL 항목

| 등급 | 위치 | 내용 | 해결 |
|------|------|------|------|
| CRITICAL | index.ts / admin.ts | GOOGLE_CLIENT_ID/ALLOWED_EMAIL 미설정 시 admin fail-open | isAdminRequest + adminGuard fail-closed |
| HIGH | index.ts / context.ts | Bearer 비교 timing-safe하지 않음 | timingSafeStringEqual 적용 |
| MEDIUM | index.ts | ADMIN_SESSION_SECRET 미설정 경고 부재 | startup warn 추가 |
| MEDIUM | admin.ts | adminGuard ALLOWED_EMAIL 비면 통과 | !ALLOWED_EMAIL → FORBIDDEN |
