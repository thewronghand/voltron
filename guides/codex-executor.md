# Codex executor — 복잡한 구현은 `codex exec`(gpt-6.1-terra max)에 맡긴다

회사 voltron(avocado)의 "Claude Code 메인 + Codex CLI executor + Claude reviewer" 방식을 개인 프로젝트에 적용한 것이다(2026-11-12~, 시험 운용).
메인(Claude Code)은 기획·지시서·판정만 하고, 구현은 Codex가 하며, 리뷰는 다시 Claude `reviewer`가 한다. 구현한 모델과 리뷰하는 모델이 달라 교차 검증이 된다.

## 언제 위임하나

- **위임**: 5개 이상 파일 수정, 탐색·시행착오가 예상되는 구현, 구현이 길어질 때.
- **메인이 직접**: 1~4파일 수정, 리뷰 지적(minor) 반영, 실험·측정 스크립트, 설계가 아직 열려 있는 스파이크.
- 판단이 애매하면 메인이 시작하고, 커지면 그때 넘긴다.
- 아키텍처·범위 결정은 위임하지 않는다. 지시서를 쓸 수 없을 만큼 모호하면 아직 위임할 때가 아니다.

## 실행

지시서·최종 보고·로그는 `<project>/<project>-workflow/exec/<작업명>/`에 둔다. 라운드마다 N을 1씩 올리고 같은 라운드의 세 파일에 같은 번호를 붙인다. scratchpad에는 다시 만들 수 있는 임시 파일만 둔다(재부팅 유실).

```bash
codex exec -m gpt-6.1-terra -c model_reasoning_effort=max -c service_tier=priority \
  -c 'sandbox_workspace_write.writable_roots=["/Users/euihyeon/.cache/uv"]' \
  -C <코드 레포 또는 worktree> --approve-for-me \
  -o <exec폴더>/r1-last.md - < <exec폴더>/r1-지시.md > <exec폴더>/r1.log 2>&1
```

- Bash `run_in_background: true`로 돌리고 완료 알림을 기다린다(폴링 금지). 백그라운드 timeout은 `7200000`(2h)으로 명시한다. 기본 30분이면 구현 도중 kill된다(avocado 2026-10-02 실측).
- `-c service_tier=priority`는 terra Fast 티어(1.5x 속도, `~/.codex/models_cache.json` 기준).
- `-C`는 작업 대상 코드 레포. 보호 브랜치(`main`/`develop`)가 아닌 작업 브랜치인지 먼저 확인한다. 브랜치 가드 훅은 Codex의 쓰기를 막지 못한다.
- `--approve-for-me`와 `-s`는 같이 쓰지 않는다(인자 오류).
- 프롬프트를 인자로 줄 때는 `< /dev/null`로 stdin을 닫는다(안 닫으면 추가 입력을 기다리며 멈춘다).
- **샌드박스 쓰기 경로**: 기본은 작업 폴더·`/tmp`·`$TMPDIR`뿐이다. 프로젝트 도구가 쓰는 캐시를 `writable_roots`에 더한다.
  - Python(uv): `~/.cache/uv`. 빠뜨리면 `Failed to initialize cache at ~/.cache/uv ... Operation not permitted`로 `uv run`이 전부 실패한다(thebooth 2026-11-12 실측).
  - Node 프로젝트는 pnpm store 등 해당 캐시 경로를 첫 위임 때 점검하고 이 목록에 추가한다.
- **resume**(끊겼거나 수정 라운드를 같은 맥락으로 이어줄 때):
  `cd <코드 레포> && codex exec resume <session id> -m gpt-6.1-terra -c model_reasoning_effort=max -o <exec폴더>/r2-last.md - < <exec폴더>/r2-지시.md > <exec폴더>/r2.log 2>&1`
  session id는 로그 헤더에 있다. resume은 `--approve-for-me`·`-C`를 받지 않는다(EXIT 2). 전역 `~/.codex/config.toml`의 `approvals_reviewer = "auto_review"`가 같은 역할을 한다.

## 지시서

첫머리에 역할 선언 블록을 넣는다. `codex exec`로 뜬 세션은 역할 에이전트가 아니라 일반 세션이라, 블록이 없으면 AGENTS.md의 오케스트레이터 규칙(리뷰 호출 등)을 자기 일로 받는다(avocado 2026-10-28 실측).

```
역할: executor (위임받은 실행자 — AGENTS.md "위임받은 executor" 절 적용)
- 하위 에이전트(reviewer 등)를 띄우지 않는다.
- 판정 파일을 쓰지 않고, 보고에 PASS·독립 리뷰 표현을 쓰지 않는다. 게이트 EXIT와 관측 사실만 쓴다.
- 지시된 구현·게이트·보고까지만 한다. 독립 판정은 호출 세션이 받는다.
- 커밋하지 않는다.
```

그 밖에 반드시 넣는 것:
- **작업 설명**: 무엇을 구현할지, 사용자 요구사항 원문.
- **범위 경계**: 대상 파일·모듈, 건드리지 말 것. 범위 밖이 필요하면 멈추고 보고하게 한다.
- **필독 정본**: 프로젝트 `CLAUDE.md`, 기획·why-tho·cookbook의 해당 문서 경로.
- **완료 조건과 검증 명령**: 프로젝트 검증 게이트(lint·typecheck·test)를 그대로 옮긴다. EXIT는 파이프 없이 받게 쓴다(`cmd; echo "EXIT=$?"`). Codex 셸에서 `${PIPESTATUS[0]}`가 빈 값으로 나왔다(2026-11-12).
- **보고 형식**: 변경 파일, 판단 사항, 빈틈·TODO, 검증 결과(EXIT 포함).

## 리뷰 루프

```
메인 → codex exec (구현) → 메인(보고·diff 확인) → reviewer (Claude, 무히스토리) → 메인
                                                     │
                                               PASS → 완료
                                               FAIL → actionable findings로 새 라운드(resume) → fresh reviewer → … PASS까지
```

- executor가 코드를 바꿨으면 완료 보고 전에 **Claude `reviewer` 에이전트**를 무히스토리로 돌린다. 넘기는 것은 대상 레포·diff 기준·변경 파일·요구사항·완료 조건·정본 경로·실행/미실행 검증뿐이다. **구현 의도·executor의 판단·대안은 넘기지 않는다**(자가평가 편향 방지).
- 메인은 executor 보고를 그대로 믿지 않는다. reviewer에게 넘기기 전에 diff를 직접 보고 게이트를 다시 돌려 EXIT를 확인한다.
- 리뷰 지적은 먼저 원문(정본·업스트림)과 대조해 사실인지 확인한다. 1~4파일짜리 minor는 메인이 직접 고치는 편이 빠르다(avocado 실측).
- 횟수 상한은 두지 않는다. 같은 blocking finding이 반복되거나, 리뷰끼리 충돌하거나, 사용자 선택·새 권한이 필요하거나, 의미 있는 진전이 불가능할 때만 근거와 함께 사용자에게 에스컬레이션한다.

## 기록과 재평가

- `exec/<작업명>/README.md`의 Experiment 표에 라운드별 소요 시간·토큰(로그의 `tokens used`)·리뷰 FAIL 횟수를 남긴다.
- 3~5건이 쌓이면 effort(max vs xhigh)·래퍼 스크립트화·기본값 확정을 재평가한다.
- Codex가 막히거나 품질이 떨어지면 메인 직접 구현으로 되돌리고 사유를 적는다.
