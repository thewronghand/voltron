// 최종 빌드 확인: full.mjs로 구성한 HOME을 새 빌드로 다시 연다.
// (1) 상태 기록 형식 변경 → "앱이 바뀌어" 재동기화 → 준비
// (2) 만들기 탭 엔진 상태 표시, 캐시 적중 폭탄마 만들기
// (3) 사이드카 강제 종료 → "실행 환경 다시 구성" → 다시 준비
import { execSync } from 'node:child_process'
import { launch, shot } from './launch.mjs'

const HOME = process.argv[2]
const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/app-packaging`
const INPUT = `${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`
const t0 = Date.now()
const sec = () => Math.round((Date.now() - t0) / 1000)
const { app, page } = await launch({ home: HOME })
const body = () => page.locator('body').innerText()
async function until(label, test, limitMin, onTick) {
  let last = ''
  const started = Date.now()
  for (;;) {
    const text = await body()
    if (test(text)) return text
    const rows = text.split('\n').filter((l) => /%|중|대기|경과|실패|취소|준비|구성|종료/.test(l)).slice(0, 8).join(' / ')
    if (rows !== last) { console.log(`[${sec()}s ${label}] ${rows}`); last = rows }
    if (onTick) await onTick(text)
    if (Date.now() - started > limitMin * 60_000) throw new Error(`${label} 시간 초과`)
    await page.waitForTimeout(500)
  }
}

// (1)
let updShot = false
await until('업데이트', (t) => t.includes('처리 엔진 준비됨') || /다시 시도/.test(t), 20, async (t) => {
  if (!updShot && t.includes('앱이 바뀌어')) { await shot(page, 'final-1-update-resync'); updShot = true; console.log(`[${sec()}s] "앱이 바뀌어" 안내 확인`) }
})
console.log(`[${sec()}s] 준비됨, 업데이트 안내 관측=${updShot}`)

// (2)
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async () => { const p = q.opens.shift(); return { canceled: !p, filePaths: p ? [p] : [] } }
  dialog.showSaveDialog = async () => { const p = q.saves.shift(); return { canceled: !p, filePath: p } }
}, { opens: [INPUT, `${SRC}/bomber-lyrics.txt`, `${SRC}/bomber-namu.txt`], saves: [`${OUT}/폭탄마_MR_최종.mp3`, `${OUT}/폭탄마_가사_최종.mp4`] })
await page.getByRole('button', { name: '만들기', exact: true }).first().click()
await page.waitForTimeout(500)
console.log('만들기 탭 엔진 상태 표시:', (await body()).includes('처리 엔진 준비됨'))
await page.getByRole('button', { name: '음원 파일 선택' }).click()
await page.getByRole('button', { name: 'MR 저장 위치 선택' }).click()
await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
await page.getByRole('checkbox', { name: '멜로디 가이드' }).check()
await page.getByRole('checkbox', { name: '가사 영상' }).check()
await page.getByRole('button', { name: '가사 파일 선택' }).click()
await page.getByRole('button', { name: '보조 파일 (발음·번역) 선택' }).click()
await page.getByRole('button', { name: '영상 저장 위치 선택' }).click()
await page.locator('main').getByRole('button', { name: '만들기', exact: true }).click()
const made = await until('만들기', (t) => /만들기 완료|만들기 실패/.test(t), 30)
console.log(`[${sec()}s] 만들기:`, made.includes('만들기 완료') ? '완료' : '실패', made.split('\n').filter((l) => l.includes('캐시')).join(' '))
await shot(page, 'final-2-make-result')

// (3)
const pids = execSync(`pgrep -f "${HOME}/Library/Application Support/thebooth/runtime/venv/bin/thebooth serve" || true`).toString().trim().split('\n').filter(Boolean)
console.log('사이드카 pid:', pids)
for (const pid of pids) process.kill(Number(pid), 'SIGKILL')
await until('종료 감지', (t) => t.includes('실행 환경 다시 구성'), 2)
await shot(page, 'final-3-sidecar-killed')
console.log(`[${sec()}s] 버튼:`, (await page.getByRole('button').allInnerTexts()).join(', '))
await page.getByRole('button', { name: '실행 환경 다시 구성' }).first().click()
let rebShot = false
await until('재구성', (t) => t.includes('처리 엔진 준비됨') || /다시 시도/.test(t), 20, async (t) => {
  if (!rebShot && t.includes('실행 환경을 다시 구성하고 있습니다')) { await shot(page, 'final-4-rebuild'); rebShot = true; console.log(`[${sec()}s] 재구성 안내 확인`) }
})
console.log(`[${sec()}s] 재구성 후 준비됨=${(await body()).includes('처리 엔진 준비됨')}, 재구성 안내 관측=${rebShot}`)
await shot(page, 'final-5-ready')
await app.close()
await new Promise((r) => setTimeout(r, 2000))
console.log('남은 프로세스:', execSync(`pgrep -fl "${HOME}" || true`).toString().trim() || '없음')
