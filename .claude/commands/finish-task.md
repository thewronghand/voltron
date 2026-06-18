작업을 마무리한다. 커밋부터 `develop` 머지·작업 폴더 Status 갱신·문서 정리까지 한 번에.

## 전제

- 현재 브랜치가 `feat/*` / `fix/*` / `chore/*` 작업 브랜치여야 함
  - `develop`/`main` 위에서 호출 시 즉시 중단
- 코드 레포(`*-code/`) 안에서 실행

## Phase 1: 자동 진행 (컨펌 없이)

각 단계는 멱등하게 동작 — 이미 끝난 단계는 자동 스킵.

### 1. 변경 사항 커밋

- `git status`로 변경 확인
- 변경 있으면 제목 한 줄로 커밋 (body 금지, Co-Authored-By 금지)
- 변경 없으면 스킵

### 2. 작업 브랜치 push

- `git push -u origin {current-branch}`
- 이미 up to date면 스킵

### 3. develop 머지 + push

- `git fetch origin develop`
- 머지:
  ```
  git checkout develop
  git pull origin develop
  git merge --no-ff {작업브랜치} -m "Merge {작업브랜치} into develop"
  git push origin develop
  ```
- **충돌 발생 시 즉시 중단하고 사용자에게 보고**

### 4. 작업 브랜치로 복귀

- `git checkout {작업브랜치}`

### 5. 작업 폴더 Status 갱신

- `<workflow>/tasks/ongoing/{slug}/README.md`의 `Status`를 "develop 검증 중"으로 갱신 (+ 머지 일자)
- README 못 찾으면 사용자에게 확인

## Phase 2: 문서화 + todo 점검 (자동 진행 후)

Phase 1이 끝나면 **Claude가 먼저 판단**한 뒤 사용자에게 제시. 무지성으로 "yes/no"만 묻지 말 것.

### todo 점검

- `<workflow>/tasks/todo/`를 훑어, 이번 작업으로 간접 해결·무효화된 todo 후보를 검토
- 후보 발견 시 사용자에게 제시하고 명시적 승인 후에만 삭제
- 후보 없으면 "todo 점검 — 정리할 항목 없음" 한 줄 보고

### 문서화 후보 검토

이번 작업 내용을 회상해 자명하지 않은 결정·반복 패턴·시행착오가 있었는지 자가 판단 후
`AskUserQuestion`으로 받아 yes 항목만 작성. 사용자 감정/평가 언급 금지, 사실/결정/절차만 기록.

문서화 대상:
- 같은 실수 반복 → `<workflow>/lessons/`
- 복잡한 아키텍처 결정 → `<workflow>/why-tho/`
- 반복되는 작업 패턴 → `<workflow>/cookbook/`
- Synapse 노트 제안 (새로운 것을 배웠을 때)

## 중단 조건

다음 상황은 즉시 멈추고 사용자에게 보고:

- 머지 충돌
- push 거부
- `develop`/`main` 위에서 호출됨

## 보고 형식

Phase 1 끝나면 한 번에 요약:

```
✅ 커밋: {hash} {message}
✅ 작업 브랜치 push: {branch} → origin
✅ develop 머지: {merge commit hash}
✅ develop push: develop → origin
✅ 작업 폴더 Status 갱신: develop 검증 중

다음: todo 점검 + 문서화 논의
```

## 참고

- 작업 시작: `new-task`
- git 전략: `voltron-personal/guides/git-workflow.md`
- develop → main 머지는 별도 (통합 검증 후 수동)
