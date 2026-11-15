// @thewrong/ui 0.3.0 전후 화면 비교: 빈 목록 → 추가 Modal → 만들기(캐시) → 내보내기 설정 → 가사 탭 → 곡 삭제 확인 → 준비 → 목록 Table.
// 사용: PW_CORE=... node shots.mjs before|after (빌드한 out/renderer 기준). 가사는 임의 문장만 넣는다(사용자 가사 미사용).
import { mkdirSync } from 'node:fs'
import { launch, makeHome, setChecked } from '../../song-library/e2e/launch.mjs'

const phase = process.argv[2] ?? 'after'
const DIR = `/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/thewrong-ui-0.3/screens/${phase}`
mkdirSync(DIR, { recursive: true })
const SRC = '/Users/euihyeon/Downloads/yt-test'
const shot = (page, name) => page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true })

const { app, page, close } = await launch({ home: process.env.BOOTH_HOME ?? makeHome() })
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async (_w, options) => {
    const opts = options ?? _w
    const p = opts?.properties?.includes('openDirectory') ? q.folder : q.opens.shift()
    return { canceled: !p, filePaths: p ? [p] : [] }
  }
}, { opens: [`${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`], folder: '/tmp' })
// 0.2.0은 window.confirm(네이티브) — 취소로 닫는다
page.on('dialog', (d) => { console.log('  네이티브 확인 창:', d.message()); void d.dismiss() })

const main = page.locator('main')
const step = async (name, fn) => {
  const t = Date.now()
  try { await fn() } catch (error) {
    console.log(`실패: ${name}`, error.message.split('\n')[0])
    await shot(page, `fail-${name}`); await close(); process.exit(1)
  }
  console.log(`완료: ${name} (${Math.round((Date.now() - t) / 1000)}초)`)
}

await step('빈 목록', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await shot(page, '1-list-empty')
})
await step('추가 Modal', async () => {
  await page.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByRole('button', { name: '파일 선택', exact: true }).click()
  await setChecked(page.getByRole('checkbox', { name: '가라오케 모드' }), true)
  await page.waitForTimeout(500)
  await shot(page, '2-add-modal')
})
await step('만들기', async () => {
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  // CSP(unsafe-eval 금지)라 waitForFunction 대신 locator로 폴링한다
  const folder = main.getByRole('button', { name: '폴더 선택' })
  await folder.waitFor({ timeout: 60_000 })
  for (let i = 0; i < 2400 && !(await folder.isEnabled()); i++) await page.waitForTimeout(1000)
  await page.waitForTimeout(800)
  await shot(page, '3-detail-made')
})
await step('내보내기 설정', async () => {
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  await form.getByRole('button', { name: '키 한 반음 낮추기' }).click()
  await form.getByRole('button', { name: '키 추가' }).click()
  await form.getByRole('button', { name: '키 한 반음 높이기' }).click()
  await page.waitForTimeout(400)
  await shot(page, '4-export-filled')
})
await step('가사 탭', async () => {
  await page.getByRole('tab', { name: '가사' }).click()
  await page.locator('#lyrics-text').waitFor()
  await shot(page, '5-lyrics-empty')
  await page.locator('#lyrics-text').fill('첫 번째 시험 문장\n두 번째 시험 문장')
  await page.waitForTimeout(800)
  await shot(page, '5b-lyrics-typed')
  await page.locator('#lyrics-text').fill('')
  await page.getByRole('tab', { name: '만들기·내보내기' }).click()
})
await step('곡 삭제 확인', async () => {
  await page.getByRole('button', { name: '곡 삭제' }).first().click()
  await page.waitForTimeout(600)
  const cancel = page.getByRole('button', { name: '취소', exact: true })
  if (await cancel.count()) {
    await shot(page, '6-delete-confirm')
    await cancel.last().click()
  }
})
await step('준비 화면', async () => {
  await page.getByRole('button', { name: '준비', exact: true }).click()
  await page.getByRole('heading', { name: '준비' }).waitFor()
  await page.waitForTimeout(500)
  await shot(page, '7-prepare')
})
await step('목록 Table', async () => {
  await page.getByRole('button', { name: '돌아가기', exact: true }).click()
  await page.getByRole('button', { name: '목록으로', exact: true }).click()
  await page.getByRole('table').waitFor({ timeout: 10_000 })
  await shot(page, '8-list-table')
})
await close()
