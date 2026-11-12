// 캐시 없는 실행: (a) clip-a htdemucs+가이드 끝까지, (b) clip-b 가라오케 분리 중 취소
import { launch, shot } from './launch.mjs'

const OUT = '/Users/euihyeon/Downloads/yt-test/thebooth-out'
const { app, page } = await launch()
const queue = { opens: [`${OUT}/clip-a.mp3`, `${OUT}/clip-b.mp3`], saves: [`${OUT}/app-e2e/clip-a_MR.mp3`, `${OUT}/app-e2e/clip-b_MR.mp3`] }
await app.evaluate(({ dialog }, q) => {
  dialog.showOpenDialog = async () => { const p = q.opens.shift(); return { canceled: !p, filePaths: p ? [p] : [] } }
  dialog.showSaveDialog = async () => { const p = q.saves.shift(); return { canceled: !p, filePath: p } }
}, queue)
await page.getByText('처리 엔진 준비됨').waitFor({ timeout: 60_000 })
await page.getByRole('button', { name: '만들기', exact: true }).first().click()

const main = page.locator('main')
async function watch(label, stopWhen) {
  const started = Date.now()
  let last = ''
  for (;;) {
    const text = await main.innerText()
    if (/만들기 완료|만들기 실패|취소했습니다/.test(text)) return text
    const lines = text.split('\n').filter((l) => /%|진행 중|대기|취소|중…/.test(l)).join(' / ')
    if (lines !== last) { console.log(`[${label} ${Math.round((Date.now() - started) / 1000)}s] ${lines}`); last = lines }
    if (stopWhen && await stopWhen(text)) return null
    if (Date.now() - started > 20 * 60_000) throw new Error('시간 초과')
    await page.waitForTimeout(1000)
  }
}

// (a)
await page.getByRole('button', { name: '파일 선택', exact: true }).first().click()
await page.getByRole('button', { name: '저장 위치 선택' }).first().click()
await page.getByRole('checkbox', { name: '멜로디 가이드' }).check()
await main.getByRole('button', { name: '만들기', exact: true }).click()
let shotTaken = false
await watch('a', async (t) => { if (!shotTaken && t.includes('보컬 분리')) { await page.waitForTimeout(1500); await shot(page, 'fresh-a-running'); shotTaken = true } return false })
await shot(page, 'fresh-a-result')
console.log('(a) 결과:', (await main.innerText()).split('\n').slice(0, 14).join(' | '))

// (b)
await page.getByRole('button', { name: '새로 만들기' }).click()
await page.getByRole('button', { name: '파일 선택', exact: true }).first().click()
await page.getByRole('button', { name: '저장 위치 선택' }).first().click()
await page.getByRole('checkbox', { name: '가라오케 모드' }).check()
await page.getByRole('checkbox', { name: '멜로디 가이드' }).check()
await main.getByRole('button', { name: '만들기', exact: true }).click()
await watch('b', async (t) => /보컬 분리[\s\S]*\d+%/.test(t) && /([1-9]\d)%/.test(t))
await shot(page, 'fresh-b-separating')
await main.getByRole('button', { name: '취소' }).click()
await page.waitForTimeout(800)
await shot(page, 'fresh-b-cancel-requested')
console.log('(b) 취소 요청 직후:', (await main.innerText()).split('\n').filter((l) => /취소|%/.test(l)).join(' | '))
await watch('b-cancel')
await shot(page, 'fresh-b-cancelled')
console.log('(b) 결과:', (await main.innerText()).split('\n').slice(0, 12).join(' | '))
await app.close()
