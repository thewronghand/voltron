# lyrics-video — Codex executor 기록

| 라운드 | 모델·effort | 소요 | 토큰 | 게이트 | 리뷰 |
|--------|-------------|------|------|--------|------|
| r1 | gpt-6.1-terra max (priority) | 7분 1초 | 202,227 | executor 189 passed·2 skip(미설치) → 메인이 ffmpeg 실제 `models pull`·Whisper 배치 후 191 passed·0 skip EXIT=0 | 1차 PASS (MEDIUM 7·LOW 5) |
| r2 (resume) | gpt-6.1-terra max (priority) | 5분 5초 | 443,771 | 219 passed·0 skip EXIT=0, 메인 재실행 동일 | 2차 PASS (MEDIUM 4·LOW 6) |

| r3 (resume) | gpt-6.1-terra max (priority) | 5분 22초 | 534,903 | 235 passed·0 skip | 3차 PASS (MEDIUM 1·LOW 7) |
| r4 (resume) | gpt-6.1-terra max (priority) | 3분 59초 | 1,128,031 | 249 passed·0 skip | 4차 PASS (MEDIUM 2·LOW 6) |
| r5 (resume) | gpt-6.1-terra max (priority) | 3분 41초 | 1,205,838 | 265 passed·0 skip | 5차 PASS (MEDIUM 2·LOW 5) |
- r1 session id: `01a1cfa8-2865-7d21-95e8-f9c3804dbeab`
- executor 판단: Whisper를 파일 경로로 로드하면 모델별 정렬 헤드가 빠져 명시 복원 — 리뷰에서 원본 대조 요청.
- 메인 확인: `models pull ffmpeg-macos-arm64` 실다운로드 → zip·해제 파일 sha 검증 통과, `ass` 필터 있음.
- 1차 리뷰 MEDIUM 7건(루비 앞쪽 매칭, BOM, 글자 수 불일치 무시, 같은 자리 블록 겹침, 긴 줄 잘림, 정렬 실패 경고 삼킴, 편집 ASS 덮어쓰기)은 지난 교훈대로 메인이 직접 고치지 않고 r2로 넘김.
- 메인이 실측으로 찾은 것: 새 .ass·.mp4가 0600 권한 → r2에 포함.
- r2 후 실곡 재실행: 새 실패 기준(중단·실패 경고, 20ms 미만 10%)에 걸리지 않음(경고 기타 1건), 기존 ASS 백업 동작, 5줄 글자 크기 자동 축소, 권한 0644. 43초.
- r3: 보조 원문 남는 글자 검사·NFKC·언어 코드 사전 검증·subprocess UTF-8·정렬 헤드 실검증. 실곡: `--lyrics-lang jp` 분리 전 exit 2.
- r4: 단어 단위 루비 분배(폭탄마 발음 줄 28곳 변경), 기호 허용, 각주 확장, 반복 매처. 4차 리뷰가 이전 재귀와 무작위 3만 건 동등 확인.
- r5: 루비 없는 한자 무게 1, ー·ヶ 규칙, 정규화 경로 통일, 모델 설정 단계 오류 감싸기, 일본어 주석 → 한국어. 폭탄마 ASS 변화 없음(전 한자 루비).
- 관찰: resume 라운드가 거듭될수록 토큰이 누적(r5 1.2M) — 세션 맥락이 쌓이는 비용. 리뷰 MEDIUM이 라운드마다 줄어드는 대신 경계 사례로 옮겨감(수확 체감).

## 후속 (5차 리뷰 미반영 — 사용자 지시로 커밋·머지)

- MEDIUM 라틴 문자·숫자 가중치 0 → 영어·숫자 섞인 가사에서 발음 줄이 엇갈림(J-pop에 흔함). 단어당 1 또는 모음 수 가중치 검토.
- MEDIUM 「ヵ」(U+30F5)를 「ヶ」처럼 한자로 취급(一ヵ月 합계 7 → 5).
- LOW: 루비 첫 글자 ー 허용, stable-ts import 실패 traceback, 〆·〇 한자 취급·ヮ 작은 가나, 파이프라인 수준 캐시 무효화 테스트, 공백으로 끊긴 한자 묶음 과다 계산.
