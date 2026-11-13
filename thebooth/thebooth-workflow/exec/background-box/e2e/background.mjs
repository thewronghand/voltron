// 2단계 E2E: 곡 추가·만들기(캐시 적중) → 배경 이미지 지정 → 박스 기본값 켬 확인 → 1920×1080 MP4 내보내기 → 결과 해상도 확인
// 1단계 launch.mjs(임시 HOME, 모델·캐시 링크, 빌드 렌더러 정적 서버)를 재사용한다. 배경 이미지는 ffmpeg로 만든 합성 이미지.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { launch, makeHome } from '../../song-library/e2e/launch.mjs'

const SHOTS = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/background-box/screens'
mkdirSync(SHOTS, { recursive: true })
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
const FF = join(homedir(), 'Library/Application Support/thebooth/models/ffmpeg-macos-arm64/ffmpeg')
const SRC = '/Users/euihyeon/Downloads/yt-test'
const OUT = `${SRC}/thebooth-out/background-e2e-${Date.now()}`
mkdirSync(OUT, { recursive: true })
const IMAGE = `${OUT}/합성 배경.jpg`
execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'gradients=s=1200x1600:c0=0x2a6f4f:c1=0xf2d16b,drawgrid=w=200:h=200:t=4:c=white@0.6', '-frames:v', '1', IMAGE])

const { app, page, close } = await launch({ home: makeHome() })
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async (_w, options) => {
    const opts = options ?? _w
    const p = opts?.properties?.includes('openDirectory') ? q.folder : q.opens.shift()
    return { canceled: !p, filePaths: p ? [p] : [] }
  }
}, { opens: [`${SRC}/Bomber (Re-Recording) [XifmeRdJCjo].mp3`, `${SRC}/bomber-lyrics.txt`, `${SRC}/bomber-namu.txt`, IMAGE], folder: OUT })

const main = page.locator('main')
const step = async (name, fn) => {
  try { await fn() } catch (error) {
    console.log(`실패: ${name}`, error.message.split('\n')[0])
    console.log((await page.locator('body').innerText()).slice(0, 2000))
    await close(); process.exit(1)
  }
  console.log('완료:', name)
}

await step('추가하고 만들기', async () => {
  await page.getByText('음원 파일을 끌어다 놓거나').waitFor({ timeout: 90_000 })
  await page.getByRole('button', { name: '추가', exact: true }).click()
  await page.getByRole('button', { name: '파일 선택', exact: true }).click()
  await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
  await page.getByRole('button', { name: '가사 파일 선택' }).click()
  await page.getByRole('button', { name: '보조 파일 선택' }).click()
  await page.getByRole('button', { name: '추가하고 만들기' }).click()
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === '폴더 선택')
    return button && !button.closest('fieldset')?.disabled
  }, null, { timeout: 10 * 60_000 })
})

const form = main.locator('section', { has: page.getByRole('heading', { name: '내보내기' }) })
await step('MP4 선택 전 비활성 안내', async () => {
  await form.getByText('배경, 자막 박스와 해상도는 MP4를 선택하면').waitFor()
  await shot(page, '1-export-mp3-only')
})

await step('배경 지정·박스 기본 켬', async () => {
  await form.getByRole('checkbox', { name: 'MP4' }).check()
  console.log('배경 전 박스:', await form.getByRole('checkbox', { name: '자막 박스' }).isChecked())
  await form.getByRole('button', { name: '이미지 선택' }).click()
  await form.getByText('합성 배경.jpg').first().waitFor({ timeout: 20_000 })
  await page.waitForTimeout(800)
  console.log('배경 후 박스:', await form.getByRole('checkbox', { name: '자막 박스' }).isChecked())
  await form.getByRole('combobox', { name: '해상도' }).click()
  await page.getByRole('option', { name: /1920/ }).click()
  await form.getByRole('checkbox', { name: 'MP3' }).uncheck()
  await form.getByRole('button', { name: '폴더 선택' }).click()
  await page.waitForTimeout(500)
  await shot(page, '2-export-background-box-1080')
})

await step('내보내기', async () => {
  const t = Date.now()
  await main.getByRole('button', { name: '내보내기', exact: true }).click()
  await page.getByText('내보내기 완료').first().waitFor({ timeout: 20 * 60_000 })
  console.log(`내보내기 ${Math.round((Date.now() - t) / 1000)}초`)
  await shot(page, '3-exported')
})

const mp4 = readdirSync(OUT).filter((f) => f.endsWith('.mp4'))
console.log('MP4:', mp4.length)
for (const f of mp4) {
  try { execFileSync(FF, ['-i', join(OUT, f)], { stdio: 'pipe' }) } catch (e) {
    console.log((String(e.stderr).match(/Video: [^\n]*/) ?? [''])[0].slice(0, 160))
  }
}
console.log('OUT', OUT)
await close()
