# 데스크탑 빌드 체크리스트 (Electron + Next.js standalone)

Synapse는 Electron이 Next.js standalone 서버를 `fork`로 띄우는 구조라, **개발서버에서 멀쩡한 코드가 패키징 빌드에서 깨지는** 케이스가 반복된다. 빌드·경로·asset·Electron 관련 변경을 했다면 이 체크리스트를 돈다.

## "dev에서 됐다"가 검증이 아닌 이유

| 환경 | 서버 | 경로 기준 | asset |
|------|------|-----------|-------|
| `npm run dev` | `next dev` (메모리, HMR) | `process.cwd()` / `NOTES_DIR` | Next dev가 즉석 서빙 |
| DMG (`electron:build`) | standalone `server.js` (fork) | `USER_DATA_DIR` / `~/Documents/Synapse/notes` | `copy-assets.js`가 복사한 것만 존재 |

→ 경로 분기, standalone 디렉토리 탐색, asset 복사 중 하나라도 어긋나면 **DMG에서만** 깨진다.

## 3종 빌드 검증 (릴리즈 전 전부 통과)

```bash
cd synapse-code/synapse
npm run build            # 1. Next.js 빌드 — 타입/번들 에러
npm run build:publish    # 2. 퍼블리시 모드 — Electron 의존 스텁 교체 + CI=1
npm run electron:build   # 3. DMG — standalone fork·asset·경로 실제 검증
```

## 변경 유형별 함정

- **경로를 다뤘다** → `process.cwd()`·하드코딩 경로 금지. `lib/data-path.ts`(`getUserDataDir`/`getDataFilePath`/`getExportDataDir`)·`lib/notes-path.ts` 경유했는지 확인. 컨벤션 훅이 1차로 잡지만 우회 가능하니 직접 확인.
- **새 asset/폰트/static 추가** → `scripts/copy-assets.js`가 standalone으로 복사하는 대상에 들어가는지. `next/font/google` 폰트는 `.next/static/media`에 생기는데 standalone 복사 누락 시 404.
- **Electron 전용 모듈 사용**(`electron`, `child_process`, `fs`) → 퍼블리시 빌드에서 깨질 수 있음. import가 클라이언트 번들에 섞이지 않게, 스텁 교체 대상인지 확인.
- **package.json `build.files`** → standalone에 들어갈 파일 목록. 새 런타임 의존 디렉토리 추가 시 누락되면 packaged에서 못 찾음.
- **standalone 서버 진입점** → `electron/main.js`가 `.next/standalone` 하위 디렉토리에서 `server.js`를 탐색. Next 버전 업 시 standalone 디렉토리 구조가 바뀌면 탐색 로직 점검.

## DMG에서 페이지 로드 실패 디버깅

1. Electron DevTools 콘솔에서 **전체 에러 스택** 확인 (난독화돼 있으면 소스맵 활성화)
2. `localhost:3000/_next/...` 404 → asset 복사 누락 (copy-assets / build.files)
3. `Cannot read properties of undefined` → 데이터 로딩 타이밍 or status map 미스. `STATUS_MAP[x] ?? fallback` 가드
4. 서버 자체가 안 뜸 → `electron/main.js`의 standalone `serverPath` 탐색 로그 확인
