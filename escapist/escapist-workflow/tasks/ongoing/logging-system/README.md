# 로깅 시스템 구축 (Sentry + Pino)

## Status: In Progress

## 요구사항
- 클라이언트: Sentry 연동 (에러 모니터링, 무료 티어)
- 서버: Pino 구조화 로깅 (Fastify 전환 대비, request/response 로깅)
- cli-worker: Pino 구조화 로깅 (CLI 실행 결과, 타임아웃/에러 추적)
- 공통: 로그 레벨 통일, 환경별(dev/prod) 설정 분리

## 관련 파일
- client/src/main.tsx
- server/src/index.ts
- cli-worker/src/index.ts

## 구현 방향
- **Client**: `@sentry/react` — ErrorBoundary, breadcrumbs, 환경 태깅
- **Server**: `pino` + `pino-http` — Express 미들웨어, 기존 console.log 교체
- **CLI Worker**: `pino` — CLI spawn 결과 로깅, 에러/타임아웃 추적
- Phase 5(Fastify 전환) 시 pino가 네이티브로 이어지므로 투자 가치 있음

## Branch
- feat/logging-system

## 진행 기록
- 2026-06-16 작업 시작

## 변경 파일
(완료 후 기록)

## Notes
