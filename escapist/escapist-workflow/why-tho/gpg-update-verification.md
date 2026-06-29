# GPG 서명 검증 도입 — update 명령 보안 게이트

## 상황

`admin-session`의 `update` 명령은 `git pull` 후 `pm2 restart`를 실행한다. 즉 **원격에서 코드를 내려받아 즉시 실행**하는 구조다.

관제 세션과의 논의에서 지적: GitHub 레포가 탈취되면 악의적 코드가 맥북에어에서 자동 실행될 수 있다.

## 결정

`git pull` 직후 `git verify-commit HEAD`로 GPG 서명을 검증한다.

- 서명 없음 → rollback + 실패 보고
- 신뢰하지 않는 키 → rollback + 실패 보고
- 서명 유효 → pnpm install + pm2 restart 진행

## 구현 세부

```
git rev-parse HEAD (before SHA 캡처)
  → git pull
  → git verify-commit HEAD
      실패: git reset --hard <before SHA>  ← HEAD@{1} 아닌 캡처값 사용
      성공: pnpm install --frozen-lockfile
              → pm2 restart escapist-worker
```

`HEAD@{1}` 대신 pull 전 SHA를 직접 캡처하는 이유:
- "already up to date" pull은 HEAD를 움직이지 않아 `HEAD@{1}`이 엉뚱한 reflog 엔트리를 가리킬 수 있음
- SHA 직접 캡처는 fast-forward/merge/no-op 어떤 pull 형태에서도 정확한 복귀 보장

## GPG 키 설정

- 알고리즘: Ed25519 (Curve 25519)
- 키 ID: `8D0F8A054C395458`
- 핑거프린트: `89FC AE9B C0AF 1153 6C1E 3ECA 8D0F 8A05 4C39 5458`
- 만료: 2028-06-28
- 패스프레이즈: 없음 (PM2 무인증 자동화 환경, gpg-agent 캐시 불가)
- 공개키: 맥북에어 keyring에 ultimate trust로 등록

## 트레이드오프

- **보안 강화**: 레포 탈취 → 코드 실행 공격 차단
- **운영 리스크**: gpg 미설치/키 부재 시 update 전면 차단 → SETUP.md에 gpg 설치 필수 명시 필요
- **패스프레이즈 없는 키**: 키 파일 탈취 시 서명 위조 가능 — 회사 맥북 물리 보안에 의존
