// @thewrong/ui 0.6.0 적용 화면 확인: 곡 2개 추가(만들기) → 제목줄 배치·Select·슬라이더 폭 → 탭(가사 지연 마운트·화살표·상태 유지) → 가사 단계 건너뜀 예정 → 목록 정렬.
// 사용: PW_CORE=... node shots.mjs (빌드한 out/renderer 기준). 곡 제목은 임의 문구로 바꾸고, 가사는 임의 문장만 넣는다.
import { mkdirSync, readdirSync } from 'node:fs'
import { launch, makeHome, setChecked } from '../../song-library/e2e/launch.mjs'

const DIR = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/thewrong-ui-0.6/screens'
mkdirSync(DIR, { recursive: true })
const SRC = '/Users/euihyeon/Downloads/yt-test'
const INPUT = `${SRC}/${readdirSync(SRC).filter((name) => name.endsWith('.mp3')).sort()[0]}`
const shot = (page, name) => page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true })

const { app, page, close } = await launch({ home: process.env.BOOTH_HOME ?? makeHome() })
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async (_w, options) => {
    const opts = options ?? _w
    const p = opts?.properties?.includes('openDirectory') ? q.folder : q.input
    return { canceled: !p, filePaths: p ? [p] : [] }
  }
}, { input: INPUT, folder: '/tmp' })

const main = page.locator('main')
const check = (ok, message) => { if (!ok) throw new Error(message) }
const step = async (name, fn) => {
  const t = Date.now()
  try { await fn() } catch (error) {
    console.log(`실패: ${name}`, error.message.split('\n')[0])
    await shot(page, `fail-${name}`); await close(); process.exit(1)
  }
  console.log(`완료: ${name} (${Math.round((Date.now() - t) / 1000)}초)`)
}
const width = (locator) => locator.evaluate((element) => Math.round(element.getBoundingClientRect().width))
async function addSong(title) {
  await page.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByRole('button', { name: '파일 선택', exact: true }).click()
  const titleInput = page.locator('#setup-title')
  // 파일을 고르면 제목칸이 파일 이름으로 채워진다 — 채워진 뒤에 임의 제목으로 덮는다
  for (let i = 0; i < 50 && !(await titleInput.inputValue()); i++) await page.waitForTimeout(100)
  await titleInput.fill(title)
  check(await titleInput.inputValue() === title, '제목을 바꾸지 못했습니다.')
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  const folder = main.getByRole('button', { name: '폴더 선택' })
  await folder.waitFor({ timeout: 60_000 })
  for (let i = 0; i < 2400 && !(await folder.isEnabled()); i++) await page.waitForTimeout(1000)
  await page.waitForTimeout(800)
}

await step('곡 2개 추가·만들기', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await addSong('시험 곡 나')
  await page.getByRole('button', { name: '목록으로', exact: true }).click()
  await page.getByRole('table').waitFor({ timeout: 10_000 })
  await page.waitForTimeout(1200) // 추가 시각이 달라지게 둔다
  await addSong('시험 곡 가')
})
await step('제목줄·Select·슬라이더 폭', async () => {
  const titleInput = page.locator('#song-title')
  const save = page.getByRole('button', { name: '제목 저장' })
  const [inputBox, saveBox] = [await titleInput.boundingBox(), await save.boundingBox()]
  console.log('  제목칸 폭', Math.round(inputBox.width), '/ 저장 버튼 x', Math.round(saveBox.x), '/ 같은 줄', Math.abs(inputBox.y + inputBox.height / 2 - (saveBox.y + saveBox.height / 2)) < 8)
  check(Math.abs(inputBox.y + inputBox.height / 2 - (saveBox.y + saveBox.height / 2)) < 8 && inputBox.width > 300, '제목칸과 저장 버튼이 한 줄에 놓이지 않았습니다.')
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  const gender = form.getByRole('combobox', { name: '남녀 전환' })
  const genderBox = page.locator('#export-gender').locator('xpath=ancestor::div[contains(@class,"w-40")][1]')
  console.log('  남녀 전환 컨테이너 폭', await width(genderBox))
  check(await width(genderBox) === 160, '남녀 전환 Select 폭이 160px이 아닙니다.')
  await gender.click()
  await page.getByRole('option', { name: '남→여 +5' }).click()
  await setChecked(form.getByRole('checkbox', { name: '멜로디 가이드' }), true)
  const guide = form.getByRole('slider', { name: '음량' })
  console.log('  가이드 음량 슬라이더 폭', await width(guide))
  check(await width(guide) === 128, '가이드 음량 슬라이더 폭이 128px이 아닙니다.')
  await page.waitForTimeout(400)
  await shot(page, '1-detail-controls')
})
await step('탭 지연 마운트·화살표·상태 유지', async () => {
  check(await page.locator('#lyrics-text').count() === 0, '가사 탭을 고르기 전에 가사 편집기가 있습니다.')
  const makeTab = page.getByRole('tab', { name: '만들기·내보내기' })
  await makeTab.focus(); await page.keyboard.press('ArrowRight')
  check(await page.getByRole('tab', { name: '가사' }).getAttribute('aria-selected') === 'true', '화살표 키로 가사 탭이 선택되지 않았습니다.')
  await page.locator('#lyrics-text').waitFor()
  const steps = page.getByRole('list', { name: '가사 편집 단계' })
  const ruby = steps.locator('li').nth(1)
  console.log('  루비 단계:', (await ruby.textContent())?.trim())
  check((await ruby.textContent())?.includes('건너뜀 예정'), '루비 단계에 건너뜀 예정이 보이지 않습니다.')
  await shot(page, '2-lyrics-skipped-pending')
  const typed = '첫 번째 시험 문장\n두 번째 시험 문장'
  await page.locator('#lyrics-text').fill(typed)
  await page.getByRole('tab', { name: '가사' }).focus(); await page.keyboard.press('ArrowLeft')
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  check((await form.getByRole('combobox', { name: '남녀 전환' }).textContent())?.includes('남→여 +5'), '탭을 오간 뒤 내보내기 설정이 사라졌습니다.')
  check(await page.locator('#lyrics-text').count() === 1 && !(await page.locator('#lyrics-text').isVisible()), '가사 패널이 숨긴 채 남아 있지 않습니다.')
  await page.getByRole('tab', { name: '가사' }).click()
  check(await page.locator('#lyrics-text').inputValue() === typed, '탭을 오간 뒤 가사 입력이 사라졌습니다.')
  await page.getByRole('tab', { name: '가사' }).focus()
  await shot(page, '3-tabs-focus')
  await page.locator('#lyrics-text').fill('')
  await page.getByRole('tab', { name: '만들기·내보내기' }).click()
})
await step('목록 정렬', async () => {
  await page.getByRole('button', { name: '목록으로', exact: true }).click()
  const table = page.getByRole('table')
  await table.waitFor({ timeout: 10_000 })
  const state = async () => ({
    rows: await table.locator('tbody tr').evaluateAll((rows) => rows.map((row) => row.querySelector('td')?.textContent?.trim() ?? '')),
    sorted: await table.locator('th[aria-sort]').evaluateAll((cells) => cells.map((cell) => `${cell.textContent?.trim()}:${cell.getAttribute('aria-sort')}`))
  })
  const expect = async (rows, sorted, message) => {
    const now = await state()
    console.log('  ', JSON.stringify(now))
    check(now.rows.join() === rows && now.sorted.join() === sorted, message)
  }
  await expect('시험 곡 가,시험 곡 나', '추가한 날짜:descending', '기본 정렬이 추가한 날짜 내림차순이 아닙니다.')
  await shot(page, '4-list-default')
  await table.getByRole('button', { name: '제목' }).click()
  await expect('시험 곡 가,시험 곡 나', '제목:ascending', '제목 오름차순이 아닙니다.')
  await table.getByRole('button', { name: '제목' }).click()
  await expect('시험 곡 나,시험 곡 가', '제목:descending', '제목 내림차순이 아닙니다.')
  await table.getByRole('button', { name: '추가한 날짜' }).click()
  await expect('시험 곡 나,시험 곡 가', '추가한 날짜:ascending', '추가한 날짜 오름차순이 아닙니다.')
  await table.getByRole('button', { name: '추가한 날짜' }).click()
  await expect('시험 곡 가,시험 곡 나', '추가한 날짜:descending', '추가한 날짜 내림차순으로 돌아오지 않았습니다.')
})
await close()
