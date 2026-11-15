// @thewrong/ui 0.4.0 적용 화면 확인: 곡 2개 추가(만들기) → 내보내기 슬라이더·남녀 전환 Select → 가사 탭 상태 유지 → 목록 정렬 헤더.
// 사용: PW_CORE=... node shots.mjs (빌드한 out/renderer 기준). 곡 제목은 임의 문구로 바꾸고, 가사는 임의 문장만 넣는다.
import { mkdirSync, readdirSync } from 'node:fs'
import { launch, makeHome, setChecked } from '../../song-library/e2e/launch.mjs'

const DIR = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/thewrong-ui-0.4/screens'
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
async function addSong(title, progressShot) {
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
  if (progressShot) {
    const bar = main.getByRole('progressbar').first()
    if (await bar.count()) {
      console.log('  진행 막대:', await bar.getAttribute('aria-label'), 'valuenow =', await bar.getAttribute('aria-valuenow'))
      await shot(page, progressShot)
    }
  }
  for (let i = 0; i < 2400 && !(await folder.isEnabled()); i++) await page.waitForTimeout(1000)
  await page.waitForTimeout(800)
}

await step('곡 2개 추가·만들기', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await addSong('시험 곡 나', '1-making-progress')
  await page.getByRole('button', { name: '목록으로', exact: true }).click()
  await page.getByRole('table').waitFor({ timeout: 10_000 })
  await page.waitForTimeout(1200) // 추가 시각이 달라지게 둔다
  await addSong('시험 곡 가')
  await shot(page, '2-detail-made')
})
await step('내보내기 슬라이더·Select', async () => {
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  const gender = form.getByRole('combobox', { name: '남녀 전환' })
  await gender.click()
  await page.getByRole('option', { name: '남→여 +5' }).click()
  check((await gender.textContent())?.includes('남→여 +5'), '남녀 전환 선택이 반영되지 않았습니다.')
  await setChecked(form.getByRole('checkbox', { name: '멜로디 가이드' }), true)
  const guide = form.getByRole('slider', { name: '음량' })
  await guide.focus(); await guide.press('ArrowLeft'); await guide.press('ArrowLeft')
  const guideText = await guide.getAttribute('aria-valuetext')
  const guideNumber = await form.getByLabel('가이드 음량 숫자').inputValue()
  console.log('  가이드 음량:', guideText, '/ 숫자칸', guideNumber)
  check(guideText === `${guideNumber} dB`, '가이드 음량 슬라이더와 숫자칸이 다릅니다.')
  const mp4 = form.getByRole('checkbox', { name: 'MP4' })
  if (await mp4.isEnabled()) {
    await setChecked(mp4, true)
    await setChecked(form.getByRole('checkbox', { name: '자막 박스' }), true)
    const opacity = form.getByRole('slider', { name: '불투명도' })
    await opacity.focus(); await opacity.press('ArrowRight'); await opacity.press('ArrowRight')
    const opacityText = await opacity.getAttribute('aria-valuetext')
    const opacityNumber = await form.getByLabel('박스 불투명도 숫자').inputValue()
    console.log('  박스 불투명도:', opacityText, '/ 숫자칸', opacityNumber)
    check(opacityText === `${opacityNumber}%`, '불투명도 슬라이더와 숫자칸이 다릅니다.')
  } else console.log('  MP4를 고를 수 없어 불투명도 슬라이더는 건너뜀')
  await page.waitForTimeout(400)
  await shot(page, '3-export-controls')
})
await step('가사 탭 상태 유지', async () => {
  const typed = '첫 번째 시험 문장\n두 번째 시험 문장'
  await page.getByRole('tab', { name: '가사' }).click()
  await page.locator('#lyrics-text').waitFor()
  await page.locator('#lyrics-text').fill(typed)
  await page.getByRole('tab', { name: '만들기·내보내기' }).click()
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  check((await form.getByRole('combobox', { name: '남녀 전환' }).textContent())?.includes('남→여 +5'), '탭을 오간 뒤 내보내기 설정이 사라졌습니다.')
  await page.getByRole('tab', { name: '가사' }).click()
  check(await page.locator('#lyrics-text').inputValue() === typed, '탭을 오간 뒤 가사 입력이 사라졌습니다.')
  await shot(page, '4-lyrics-kept')
  await page.locator('#lyrics-text').fill('')
  await page.getByRole('tab', { name: '만들기·내보내기' }).click()
})
await step('목록 정렬 헤더', async () => {
  await page.getByRole('button', { name: '목록으로', exact: true }).click()
  const table = page.getByRole('table')
  await table.waitFor({ timeout: 10_000 })
  const state = async () => ({
    rows: await table.locator('tbody tr').evaluateAll((rows) => rows.map((row) => row.querySelector('td')?.textContent?.trim() ?? '')),
    sorted: await table.locator('th[aria-sort]').evaluateAll((cells) => cells.map((cell) => `${cell.textContent?.trim()}:${cell.getAttribute('aria-sort')}`))
  })
  const initial = await state()
  console.log('  기본:', JSON.stringify(initial))
  check(initial.rows[0] === '시험 곡 가' && initial.sorted.join() === '추가한 날짜:descending', '기본 정렬이 추가한 날짜 내림차순이 아닙니다.')
  await shot(page, '5-list-default')
  await table.getByRole('button', { name: '제목' }).click()
  const titleAsc = await state()
  console.log('  제목 1회:', JSON.stringify(titleAsc))
  check(titleAsc.rows.join() === '시험 곡 가,시험 곡 나' && titleAsc.sorted.join() === '제목:ascending', '제목 오름차순이 아닙니다.')
  await table.getByRole('button', { name: '제목' }).click()
  const titleDesc = await state()
  console.log('  제목 2회:', JSON.stringify(titleDesc))
  check(titleDesc.rows.join() === '시험 곡 나,시험 곡 가' && titleDesc.sorted.join() === '제목:descending', '제목 내림차순이 아닙니다.')
  await shot(page, '6-list-title-desc')
  await table.getByRole('button', { name: '추가한 날짜' }).click()
  const dateAsc = await state()
  console.log('  날짜 1회:', JSON.stringify(dateAsc))
  check(dateAsc.rows.join() === '시험 곡 나,시험 곡 가' && dateAsc.sorted.join() === '추가한 날짜:ascending', '추가한 날짜 오름차순이 아닙니다.')
})
await close()
