// 3단계 E2E: 곡 추가·만들기(캐시) → 가사 탭 붙여넣기(나무위키 원문) → 루비 확인 → 저장하고 정렬(Whisper)
// → 타이밍 경계 이동·저장 → MP4 내보내기 전후 ASS 비교.
// 가사가 보이는 화면은 스크래치(SHOTS_PRIVATE)에만 저장하고, 기록 폴더에는 가사 없는 화면만 둔다.
import { mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { launch, makeHome } from '../../song-library/e2e/launch.mjs'

const PRIVATE = process.env.SHOTS_PRIVATE ?? '/tmp'
mkdirSync(PRIVATE, { recursive: true })
const shot = (page, name) => page.screenshot({ path: `${PRIVATE}/${name}.png`, fullPage: true })
const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/lyrics-e2e-${Date.now()}`
mkdirSync(OUT, { recursive: true })
const NAMU = readFileSync(`${SRC}/bomber-namu.txt`, 'utf-8')

const { app, page, close } = await launch({ home: process.env.BOOTH_HOME ?? makeHome() })
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async (_w, options) => {
    const opts = options ?? _w
    const p = opts?.properties?.includes('openDirectory') ? q.folder : q.opens.shift()
    return { canceled: !p, filePaths: p ? [p] : [] }
  }
}, { opens: [`${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`], folder: OUT })

const main = page.locator('main')
const step = async (name, fn) => {
  const t = Date.now()
  try { await fn() } catch (error) {
    console.log(`실패: ${name}`, error.message.split('\n')[0])
    console.log((await page.locator('main').innerText()).replace(/[぀-ヿ一-鿿가-힣]+/g, '…').slice(0, 1500))
    await shot(page, `fail-${name}`); await close(); process.exit(1)
  }
  console.log(`완료: ${name} (${Math.round((Date.now() - t) / 1000)}초)`)
}
const exportEnabled = () => page.waitForFunction(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === '폴더 선택')
  return button && !button.closest('fieldset')?.disabled
}, null, { timeout: 40 * 60_000 })

await step('곡 추가·만들기', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await page.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByRole('button', { name: '파일 선택', exact: true }).click()
  await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  await exportEnabled()
})

await step('가사 탭 붙여넣기', async () => {
  await page.getByRole('tab', { name: '가사' }).click()
  await page.locator('#lyrics-text').fill(NAMU)
  await page.getByText(/\d+블록 · 섹션 \d+개, 각주 \d+개 제거/).waitFor({ timeout: 30_000 })
  console.log('  ', (await page.getByText(/\d+블록 · 섹션/).innerText()))
  await shot(page, 'l1-paste')
})

await step('루비 확인', async () => {
  await page.getByRole('button', { name: '다음 · 루비 확인' }).click()
  const remaining = page.getByText(/확인 필요 \d+곳/)
  await remaining.waitFor()
  console.log('  처음', await remaining.innerText())
  await shot(page, 'l2-ruby')
  // 경계 토글 한 번(첫 블록 첫 묶음의 첫 가나)
  const first = page.getByRole('button', { name: /번째 블록 1번째 한자 묶음의 루비 경계 1$/ }).first()
  await first.click()
  console.log('  토글 후', await remaining.innerText())
  for (let i = 0; i < 200; i++) {
    const confirm = page.getByRole('button', { name: /이 블록의 추정 확인/ }).first()
    if (!(await confirm.count())) break
    await confirm.click()
  }
  console.log('  확인 후', await remaining.innerText())
})

await step('저장하고 정렬', async () => {
  await page.getByRole('button', { name: '저장하고 정렬' }).click()
  await page.waitForTimeout(1500)
  const alert = page.getByRole('alert')
  if (await alert.count()) console.log('  알림:', (await alert.first().innerText()).replace(/[぀-ヿ一-鿿]+/g, '…'))
  await page.getByRole('button', { name: '다음 · 타이밍' }).waitFor()
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === '다음 · 타이밍')
    return button && !button.disabled
  }, null, { timeout: 40 * 60_000 })
})

const exportOnce = async (label) => {
  await page.getByRole('tab', { name: '만들기·내보내기' }).click()
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  await form.getByRole('checkbox', { name: 'MP4' }).check()
  await form.getByRole('checkbox', { name: 'MP3' }).uncheck()
  await form.getByRole('button', { name: '폴더 선택' }).click()
  const before = readdirSync(OUT).filter((f) => f.endsWith('.mp4')).length
  await main.getByRole('button', { name: '내보내기', exact: true }).click()
  // 이전 내보내기의 '완료' 문구가 남아 있으므로 새 MP4가 생길 때까지 기다린다
  for (let i = 0; i < 1200 && readdirSync(OUT).filter((f) => f.endsWith('.mp4')).length === before; i++) await page.waitForTimeout(1000)
  console.log(`  ${label} 내보내기 완료`)
}

await step('수정 전 내보내기', () => exportOnce('수정 전'))

await step('타이밍 수정', async () => {
  await page.getByRole('tab', { name: '가사' }).click()
  await page.getByRole('button', { name: '다음 · 타이밍' }).click()
  await page.getByRole('button', { name: /번째 글자 시작 경계/ }).first().waitFor({ timeout: 60_000 })
  console.log('  경계 버튼 진단', JSON.stringify(await page.evaluate(() => {
    const all = [...document.querySelectorAll('button[aria-label$="글자 시작 경계"]')]
    const names = all.map((b) => b.getAttribute('aria-label'))
    const panels = new Set(all.map((b) => b.closest('[role=tabpanel]')?.id))
    const timelines = document.querySelectorAll('[aria-label="보컬 파형과 글자 타이밍"]').length
    return { count: all.length, dup: names.filter((n, i) => names.indexOf(n) !== i).slice(0, 3), panels: [...panels], timelines }
  })))
  const edge = page.getByRole('button', { name: '2번째 글자 시작 경계', exact: true })
  await shot(page, 'l3-timing')
  await edge.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await page.getByText('· 수정됨').first().waitFor({ timeout: 20_000 })
})

await step('수정 후 내보내기', () => exportOnce('수정 후'))

const asses = readdirSync(OUT).filter((f) => f.endsWith('.ass')).sort()
console.log('ASS', asses.length)
if (asses.length === 2) {
  const [a, b] = asses.map((f) => readFileSync(`${OUT}/${f}`, 'utf-8').split('\n'))
  const diff = a.map((line, i) => line !== b[i] ? i : -1).filter((i) => i >= 0)
  console.log('달라진 줄 수', diff.length, '줄 번호', diff.slice(0, 6).join(','), '/ 전체', a.length)
}
console.log('OUT', OUT)
await close()
