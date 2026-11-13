// 완료 기준 E2E: 빈 HOME으로 패키징 앱을 열어 첫 실행 환경 구성 → 준비 화면 모델 받기 →
// 폭탄마 "가라오케 MR + 멜로디 가이드 + 가사 영상" 완성까지 화면 조작으로 진행한다.
// 파일 대화상자만 main 프로세스에서 대체한다. HOME은 인자로 받는다(재실행 시 이어서).
import { mkdirSync } from 'node:fs'
import { launch, shot } from './launch.mjs'

const HOME = process.argv[2]
const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/app-packaging`
mkdirSync(OUT, { recursive: true })
mkdirSync(HOME, { recursive: true })
const INPUT = `${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`
const MODELS = ['melband-roformer-karaoke', 'whisper-large-v3', 'ffmpeg-macos-arm64']
const t0 = Date.now()
const sec = () => Math.round((Date.now() - t0) / 1000)

const { app, page } = await launch({ home: HOME })
console.log(`[${sec()}s] HOME ${HOME}`)
const main = page.locator('main')
async function until(label, test, limitMin, onTick) {
  let last = ''
  const started = Date.now()
  for (;;) {
    const text = await page.locator('body').innerText()
    const result = test(text)
    if (result) return text
    const rows = text.split('\n').filter((l) => /%|중|대기|경과|실패|취소|준비/.test(l)).slice(0, 8).join(' / ')
    if (rows !== last) { console.log(`[${sec()}s ${label}] ${rows}`); last = rows }
    if (onTick) await onTick(text)
    if (Date.now() - started > limitMin * 60_000) throw new Error(`${label} 시간 초과`)
    await page.waitForTimeout(1000)
  }
}

// 1. 첫 실행 환경 구성
await page.waitForTimeout(1500)
await shot(page, 'full-1-runtime-start')
let midShot = false
await until('환경', (t) => t.includes('처리 엔진 준비됨') || /다시 시도|다시 시작/.test(t), 40, async (t) => {
  if (!midShot && t.includes('설치하고 있습니다') && sec() > 20) { await shot(page, 'full-2-runtime-syncing'); midShot = true }
})
const afterRuntime = await page.locator('body').innerText()
if (!afterRuntime.includes('처리 엔진 준비됨')) { await shot(page, 'full-x-runtime-failed'); console.log(afterRuntime); throw new Error('환경 구성 실패') }
console.log(`[${sec()}s] 환경 구성 완료`)
await shot(page, 'full-3-runtime-ready')

// 2. 모델 받기 (준비 화면)
await page.getByRole('button', { name: '준비', exact: true }).first().click()
for (const id of MODELS) {
  const btn = page.getByRole('button', { name: `${id} 받기`, exact: true })
  if (await btn.count()) await btn.click()
}
await page.waitForTimeout(3000)
await shot(page, 'full-4-models-downloading')
await until('모델', (t) => MODELS.every((id) => {
  const i = t.indexOf(id); return i >= 0 && /설치됨|받기 완료/.test(t.slice(i, i + 400))
}) , 60)
console.log(`[${sec()}s] 모델 받기 완료`)
await shot(page, 'full-5-models-installed')

// 3. 만들기
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async () => { const p = q.opens.shift(); return { canceled: !p, filePaths: p ? [p] : [] } }
  dialog.showSaveDialog = async () => { const p = q.saves.shift(); return { canceled: !p, filePath: p } }
}, {
  opens: [INPUT, `${SRC}/bomber-lyrics.txt`, `${SRC}/bomber-namu.txt`],
  saves: [`${OUT}/폭탄마_MR.mp3`, `${OUT}/폭탄마_가사.mp4`]
})
await page.getByRole('button', { name: '만들기', exact: true }).first().click()
await page.getByRole('button', { name: '음원 파일 선택' }).click()
await page.getByRole('button', { name: 'MR 저장 위치 선택' }).click()
await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
await page.getByRole('checkbox', { name: '멜로디 가이드' }).check()
await page.getByRole('checkbox', { name: '가사 영상' }).check()
await page.getByRole('button', { name: '가사 파일 선택' }).click()
await page.getByRole('button', { name: '보조 파일 (발음·번역) 선택' }).click()
await page.getByRole('button', { name: '영상 저장 위치 선택' }).click()
await page.waitForTimeout(500)
await shot(page, 'full-6-make-filled')
await main.getByRole('button', { name: '만들기', exact: true }).click()
let shots = 0
const makeStart = Date.now()
const done = await until('만들기', (t) => /만들기 완료|만들기 실패|취소했습니다/.test(t), 90, async (t) => {
  if (shots < 3 && /\d+%/.test(t) && Date.now() - makeStart > shots * 120_000 + 5_000) { await shot(page, `full-7-make-running-${shots}`); shots++ }
})
console.log(`[${sec()}s] 만들기 끝 (${Math.round((Date.now() - makeStart) / 1000)}초)`)
await shot(page, 'full-8-make-result')
console.log(done.includes('만들기 완료') ? '결과: 완료' : '결과: 실패/취소')
console.log(await main.ariaSnapshot())
await app.close()
console.log(`[${sec()}s] 종료`)
