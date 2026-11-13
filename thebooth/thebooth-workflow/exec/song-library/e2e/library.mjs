// 곡 보관함 E2E: 빈 목록 → 추가 Modal(폭탄마, 가라오케, 가사·보조) → 만들기 → 여러 키로 MP3·MP4 내보내기(두 번, 번호 붙이기) → 목록 Table
// 파일·폴더 대화상자만 main 프로세스에서 대체하고 나머지는 화면 조작으로 진행한다.
import { mkdirSync, readdirSync } from 'node:fs'
import { launch, makeHome, shot } from './launch.mjs'

const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/library-e2e-${Date.now()}`
mkdirSync(OUT, { recursive: true })
mkdirSync('/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/song-library/screens', { recursive: true })
const INPUT = `${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`
const home = process.env.BOOTH_HOME ?? makeHome()
console.log('HOME', home, 'OUT', OUT)

const { app, page, close } = await launch({ home })
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async (_w, options) => {
    const opts = options ?? _w
    const p = opts?.properties?.includes('openDirectory') ? q.folder : q.opens.shift()
    return { canceled: !p, filePaths: p ? [p] : [] }
  }
}, { opens: [INPUT, `${SRC}/bomber-lyrics.txt`, `${SRC}/bomber-namu.txt`], folder: OUT })

const main = page.locator('main')
const step = async (name, fn) => {
  try { await fn() } catch (error) {
    console.log(`실패: ${name}`, error.message.split('\n')[0])
    console.log((await page.locator('body').innerText()).slice(0, 2500))
    await shot(page, `fail-${name}`)
    await close()
    process.exit(1)
  }
  console.log('완료:', name)
}

await step('빈 목록', async () => {
  await page.getByText('곡 보관함').first().waitFor({ timeout: 90_000 })
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await shot(page, '1-empty-list')
})

await step('추가 Modal', async () => {
  await page.getByRole('button', { name: '추가', exact: true }).click()
  // @thewrong/ui Modal에는 role=dialog가 없어 페이지 기준으로 찾는다
  const dialog = page
  await page.getByRole('button', { name: '추가하고 만들기' }).waitFor()
  await dialog.getByRole('button', { name: '파일 선택', exact: true }).click()
  await dialog.getByRole('checkbox', { name: '가라오케 모드' }).check()
  await dialog.getByRole('button', { name: '가사 파일 선택' }).click()
  await dialog.getByRole('button', { name: '보조 파일 선택' }).click()
  await page.waitForTimeout(500)
  await shot(page, '2-add-modal')
})

let started = 0
await step('추가하고 만들기', async () => {
  started = Date.now()
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  await main.getByRole('heading', { name: '내보내기' }).waitFor({ timeout: 60_000 })
  await page.waitForTimeout(1500)
  await shot(page, '3-detail-making')
  // 만들기가 끝나면 내보내기 영역이 활성화된다
  await main.getByRole('button', { name: '폴더 선택' }).waitFor()
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === '폴더 선택')
    return button && !button.closest('fieldset')?.disabled
  }, null, { timeout: 40 * 60_000 })
  console.log(`만들기 ${Math.round((Date.now() - started) / 1000)}초`)
  await shot(page, '4-detail-made')
})

await step('내보내기 설정', async () => {
  const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
  await form.getByRole('checkbox', { name: 'MP4' }).check()
  await form.getByRole('button', { name: '키 한 반음 낮추기' }).click()
  await form.getByRole('button', { name: '키 한 반음 낮추기' }).click()
  await form.getByRole('button', { name: '키 추가' }).click()
  await form.getByRole('button', { name: '키 한 반음 높이기' }).click()
  await form.getByRole('button', { name: '키 한 반음 높이기' }).click()
  await form.getByRole('button', { name: '키 한 반음 높이기' }).click()
  console.log('남녀 전환 버튼 수', await form.getByRole('combobox', { name: '남녀 전환' }).count())
  await form.getByRole('combobox', { name: '남녀 전환' }).click()
  await page.waitForTimeout(300)
  console.log('옵션들', await page.getByRole('option').allInnerTexts())
  await page.getByRole('option', { name: '여→남 -5' }).click()
  await form.getByRole('button', { name: '키 추가' }).click()
  await form.getByRole('checkbox', { name: '멜로디 가이드' }).check()
  await form.getByRole('button', { name: '폴더 선택' }).click()
  await page.waitForTimeout(500)
  await shot(page, '5-export-filled')
})

for (const round of [1, 2]) {
  await step(`내보내기 ${round}`, async () => {
    const t = Date.now()
    await main.getByRole('button', { name: '내보내기', exact: true }).click()
    await page.waitForTimeout(1500)
    if (round === 1) await shot(page, '6-exporting')
    await page.getByText(/내보내기 완료|내보냈습니다/).first().waitFor({ timeout: 30 * 60_000 })
    console.log(`내보내기 ${round}: ${Math.round((Date.now() - t) / 1000)}초`)
    await shot(page, `7-exported-${round}`)
  })
}
console.log('출력 파일:', readdirSync(OUT).sort().join(' | '))

await step('만들기 설정 Modal', async () => {
  await main.getByRole('button', { name: '만들기 설정' }).click()
  await page.getByRole('button', { name: '저장', exact: true }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, '8-setup-modal-edit')
  await page.getByRole('button', { name: '취소', exact: true }).last().click()
})

await step('목록 Table', async () => {
  await main.getByRole('button', { name: '목록으로' }).click()
  await page.getByRole('table').waitFor()
  await page.waitForTimeout(400)
  await shot(page, '9-list-table')
})

console.log('HOME', home)
await close()
