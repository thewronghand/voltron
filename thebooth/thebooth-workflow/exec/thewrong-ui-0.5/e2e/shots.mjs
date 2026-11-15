// @thewrong/ui 0.5.0 적용 화면 확인: 곡 추가(만들기) → 체크박스 라벨·박스 클릭 토글 → 삭제 확인 창 첫 포커스·설명 연결 → 가사 단계 이름.
// 사용: PW_CORE=... node shots.mjs (빌드한 out/renderer 기준). 곡 제목은 임의 문구로 바꾼다.
import { mkdirSync, readdirSync } from 'node:fs'
import { launch, makeHome } from '../../song-library/e2e/launch.mjs'

const DIR = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/thewrong-ui-0.5/screens'
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

await step('곡 추가·만들기', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await page.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByRole('button', { name: '파일 선택', exact: true }).click()
  const title = page.locator('#setup-title')
  for (let i = 0; i < 50 && !(await title.inputValue()); i++) await page.waitForTimeout(100)
  await title.fill('시험 곡')
  check(await title.inputValue() === '시험 곡', '제목을 바꾸지 못했습니다.')
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  const folder = main.getByRole('button', { name: '폴더 선택' })
  await folder.waitFor({ timeout: 60_000 })
  for (let i = 0; i < 2400 && !(await folder.isEnabled()); i++) await page.waitForTimeout(1000)
  await page.waitForTimeout(800)
})
await step('체크박스 토글', async () => {
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  const guide = form.getByRole('checkbox', { name: '멜로디 가이드' })
  const label = form.locator('label', { hasText: '멜로디 가이드' })
  const before = await guide.isChecked()
  await label.getByText('멜로디 가이드').click()
  check(await guide.isChecked() === !before, '라벨 글자 클릭이 한 번 토글하지 않았습니다.')
  await guide.click()
  check(await guide.isChecked() === before, '박스 클릭이 한 번 토글하지 않았습니다.')
  await guide.check()
  check(await guide.isChecked(), 'Playwright check()가 동작하지 않았습니다.')
  await guide.focus(); await page.keyboard.press('Space')
  check(!(await guide.isChecked()), '스페이스 키가 한 번 토글하지 않았습니다.')
  await guide.focus()
  console.log('  라벨·박스·check()·스페이스 모두 한 번씩 토글')
  await shot(page, '1-checkbox-focus')
})
await step('삭제 확인 창', async () => {
  await page.getByRole('button', { name: '곡 삭제' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  await page.waitForTimeout(400)
  const focused = await page.locator('body').evaluate(() => document.activeElement?.textContent ?? '')
  const described = await dialog.evaluate((element) => {
    const id = element.getAttribute('aria-describedby')
    return id ? document.getElementById(id)?.textContent ?? '' : ''
  })
  console.log('  첫 포커스:', focused, '/ 설명:', described)
  check(focused === '취소', '첫 포커스가 취소 버튼이 아닙니다.')
  check(described.startsWith('이 곡을 삭제할까요?'), '대화상자 설명이 본문과 연결되지 않았습니다.')
  await shot(page, '2-delete-confirm')
  await page.keyboard.press('Enter')
  await dialog.waitFor({ state: 'hidden' })
  check(await page.getByRole('button', { name: '목록으로', exact: true }).isVisible(), 'Enter로 취소한 뒤 곡 상세가 남아 있지 않습니다.')
  console.log('  Enter = 취소, 곡 유지')
})
await step('가사 단계 이름', async () => {
  await page.getByRole('tab', { name: '가사' }).click()
  const steps = page.getByRole('list', { name: '가사 편집 단계' })
  await steps.waitFor()
  const current = await steps.locator('[aria-current="step"]').textContent()
  console.log('  현재 단계:', current?.trim(), '/ 루비 단계:', (await steps.locator('li').nth(1).textContent())?.trim())
  await shot(page, '3-lyrics-stepper')
})
await close()
