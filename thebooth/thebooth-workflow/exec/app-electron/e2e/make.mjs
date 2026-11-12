// 만들기 E2E: 폭탄마 → 가라오케 MR + 멜로디 가이드 + 가사 영상
// 파일 대화상자만 main 프로세스에서 대체하고 나머지는 화면 조작으로 진행한다.
// 도중에 입력을 바꿔(클립 → 전곡) 저장 이름 갱신·가사 선택 비우기 안내도 확인한다.
import { mkdirSync } from 'node:fs'
import { launch, shot } from './launch.mjs'

const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/app-e2e`
mkdirSync(OUT, { recursive: true })
const INPUT = `${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`
const CLIP = `${SRC}/thebooth-out/clip-a.mp3`

const { app, page } = await launch()
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async () => { const p = q.opens.shift(); return { canceled: !p, filePaths: p ? [p] : [] } }
  dialog.showSaveDialog = async () => { const p = q.saves.shift(); return { canceled: !p, filePath: p } }
}, {
  opens: [CLIP, `${SRC}/bomber-lyrics.txt`, INPUT, `${SRC}/bomber-lyrics.txt`, `${SRC}/bomber-namu.txt`],
  saves: [`${OUT}/clip_MR.mp3`, `${OUT}/폭탄마_가사.mp4`]
})
const main = page.locator('main')
const pathsShown = async () => (await main.innerText()).split('\n').filter((l) => l.startsWith('/')).join(' | ')

await page.getByText('처리 엔진 준비됨').waitFor({ timeout: 60_000 })
await page.getByRole('button', { name: '만들기', exact: true }).first().click()
await page.getByRole('button', { name: '음원 파일 선택' }).click()
await page.getByRole('button', { name: 'MR 저장 위치 선택' }).click()
await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
await page.getByRole('checkbox', { name: '멜로디 가이드' }).check()
await page.getByRole('checkbox', { name: '가사 영상' }).check()
await page.getByRole('button', { name: '가사 파일 선택' }).click()
await page.waitForTimeout(300)
console.log('입력 변경 전:', await pathsShown())
await page.getByRole('button', { name: '음원 파일 선택' }).click()
await page.waitForTimeout(500)
console.log('입력 변경 후:', await pathsShown())
console.log('안내:', (await main.innerText()).split('\n').filter((l) => l.includes('바꾸고')).join(' | '))
await shot(page, 'make-input-changed')
await page.getByRole('button', { name: '가사 파일 선택' }).click()
await page.getByRole('button', { name: '보조 파일 (발음·번역) 선택' }).click()
await page.getByRole('button', { name: '영상 저장 위치 선택' }).click()
await page.waitForTimeout(500)
console.log('실행 직전:', await pathsShown())
await shot(page, 'make-filled')

const started = Date.now()
await main.getByRole('button', { name: '만들기', exact: true }).click()
let last = ''
let shots = 0
for (;;) {
  const text = await main.innerText()
  if (/만들기 완료|만들기 실패|취소했습니다/.test(text)) break
  const rows = text.split('\n').filter((l) => /완료|진행 중|대기|%/.test(l)).join(' / ')
  if (rows !== last) { console.log(`[${Math.round((Date.now() - started) / 1000)}s] ${rows}`); last = rows }
  if (shots < 2 && /영상 만들기/.test(text) && /\d+%/.test(text)) { await shot(page, `make-running-${shots}`); shots++ }
  if (Date.now() - started > 45 * 60_000) throw new Error('시간 초과')
  await page.waitForTimeout(700)
}
console.log(`끝: ${Math.round((Date.now() - started) / 1000)}초`)
await shot(page, 'make-result')
console.log(await main.ariaSnapshot())
await app.close()
