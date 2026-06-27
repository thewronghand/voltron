작업 폴더를 생성하고 브랜치를 준비한다.

## 작업은 폴더 단위

신규 작업은 **폴더 단위**로 관리한다: `<workflow>/tasks/ongoing/{slug}/`
- `README.md` — 작업 문서 (아래 템플릿)
- `reviews/` — 리뷰 결과가 `01.md`, `02.md` ... 로 누적되는 서브디렉토리
- 작업 산출물(SQL, 메모, 스크린샷 등)도 이 폴더 안에 둔다

> `<workflow>`는 현재 프로젝트의 `*-workflow/` 폴더. 프로젝트 CLAUDE.md에서 경로를 확인.

## 사용법

- `/new-task` — 대화로 작업 정보 수집
- `/new-task {제목}` — 제목 지정하고 바로 시작

## 절차

1. **작업 정보 수집**
   - 제목 (한국어)
   - 슬러그 (kebab-case, 폴더명·브랜치명에 사용)
   - 짧은 배경/요구사항 설명
   - 인자로 제목이 들어오면 슬러그는 자동 생성 후 확인

2. **todo 매치 검사**
   - `<workflow>/tasks/todo/`에 관련 항목이 있으면 사용자에게 제시
   - 동의하면 todo 내용을 새 작업 README의 요구사항/구현 방향에 통합하고 원본 todo 파일은 삭제

3. **작업 폴더 생성**
   - `<workflow>/tasks/ongoing/{slug}/README.md` (템플릿) + `reviews/`

4. **브랜치 준비**
   - 브랜치명 제안: `feat/{slug}` (결함이면 `fix/`, 잡무면 `chore/`)
   - 분기 베이스는 항상 `origin/main` (git-workflow.md 규칙)
   - 분기 명령: `git checkout --no-track -b {branch} origin/main`

5. **voltron-bus 연결 제안**
   - 작업이 확정됐으면 이 세션을 personal 버스에 연결할지 사용자에게 제안한다
   - 연결명 형식: `프로젝트-작업명` (예: `escapist-logging-system`, `ui-chore-deps-bump`)
   - 개인 프로젝트는 티켓 번호 없음 (회사판과 다름)
   - 허브 세션에서는 `voltron-bus`, 작업 세션에서는 `voltron-bus-spoke` 사용

6. **시작 보고**
   - 작업 폴더 경로
   - 추천 브랜치명
   - todo 흡수 여부

## README 템플릿

```markdown
# {작업명}

## Status: In Progress

## 요구사항
- {배경/요구사항}

## 관련 파일
- {경로}

## 구현 방향
- {접근}

## Branch
- {추천 브랜치명}

## 진행 기록
- {YYYY-MM-DD} 작업 시작

## 변경 파일
(완료 후 기록)

## Notes
```

## 참고

- 완료 시 작업 폴더를 통째로 `tasks/completed/`로 이동 (사용자 확인 후)
- git 전략: `voltron-personal/guides/git-workflow.md`
