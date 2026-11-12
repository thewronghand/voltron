# thebooth

노래방 연습용 로컬 앱. 음원을 넣으면 **보컬 제거 → 키 변경 → 멜로디 가이드 → 가사 자막**을 입혀,
TJ·금영 반주기의 USB 재생('나의 MP3')에 그대로 꽂아 부를 수 있는 파일을 만든다.

> 기획 정본: [`thebooth-workflow/planning/00-기획.md`](thebooth-workflow/planning/00-기획.md) — 배경·기능·단계·결정 기록. **작업 전 필독.**

## Critical Rules (절대 규칙)

1. **로컬 처리만** — 음원은 사용자 PC 밖으로 나가지 않는다. 음원을 서버에 올리거나 결과물을 공유·캐싱하는 기능을 만들지 않는다(저작권 위험이 웹 서비스 구조에서 생긴다 — 기획 문서 "결정 기록").
2. **음원 파일은 레포에 커밋하지 않는다** — 테스트용 음원은 저작권 없는 샘플이나 직접 만든 것만, 그것도 레포 밖 경로에 둔다.
3. **결과물은 반주기에서 실제로 틀어서 판정** — 로컬 플레이어에서 잘 나와도 반주기 USB 재생에서 안 되면 미완료다.
4. **모델은 앱 패키지에 넣지 않는다** — manifest 기반 다운로드로만 받고, 저장 위치는 하나(개발·앱·CLI 공유). 라이브러리 자동 다운로드(torch hub·HF 캐시)에 기대지 않고 경로를 명시적으로 넘긴다.
5. **TS: `any` 금지, 폴더 밖 import는 `@/`** — voltron-personal 공통 규칙. Python은 타입 힌트 필수, 관례(PEP 8)를 따른다.

## 정체성

- **성격**: 개인 연습용 데스크탑 앱(macOS arm64·Windows x64). 상용 서비스·호스팅 없음. 배포는 본인 사용 기준(서명·공증은 필요해질 때).
- **스택**: Electron(TS, 렌더러 React) 셸 + Python 처리 코어 사이드카(FastAPI). Python 환경은 앱에 넣은 `uv`로 첫 실행 시 구성. 상세·결정 이유는 기획 문서 "아키텍처"·"결정 기록".
- **오디오 도구**: Demucs(보컬 분리 기본, HF 고정 리비전), Mel-Band RoFormer(옵트인 일반·가라오케, `bs-roformer==0.3.10` 고정), pedalboard(키 변경·오디오 IO, Rubber Band 내장), CREPE·basic-pitch(피치), WhisperX(가사 정렬), ffmpeg+libass(ASS `\k` 자막 렌더링).
- **git**: 개인 계정 `thewronghand` (local config). 레포 `thewronghand/thebooth` — GitHub 레포는 아직 없음.

## 구조

```
thebooth/
  CLAUDE.md               ← 이 파일
  thebooth-workflow/      ← 하네스 (voltron-personal git이 추적)
    planning/             ← 기획 정본
    why-tho/              ← 설계 결정 이유
    lessons/              ← 막힌 지점·시행착오
    hooks/ settings.json sync-claude.sh
  thebooth-code/          ← 코드 레포 (독립 git)
```

## 작업 하네스

- **세션 연결**: 작업 내용이 확정되면 `/voltron-bus-spoke`로 personal 버스 연결을 **제안한다** (연결명 `booth-작업명`, 예: `booth-vocal-separation`).
- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 구현(5개+ 파일은 Codex executor `codex exec` gpt-6.1-terra max, 작으면 메인) → `reviewer` 독립 리뷰 루프. 정본 [`../guides/codex-executor.md`](../guides/codex-executor.md). Python 프로젝트라 `writable_roots`에 `~/.cache/uv`가 필요하다.
- **구현 후 리뷰**: 5개 파일 이상/탐색 필요한 변경은 `reviewer` 에이전트로 diff 기반 리뷰.
- **훅**: 보호 브랜치 가드 + 컨벤션 경고 (`thebooth-workflow/hooks/`).
