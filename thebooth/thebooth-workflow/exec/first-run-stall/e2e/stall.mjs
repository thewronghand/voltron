// 첫 실행 정지 재현: 연결은 받고 아무 응답도 하지 않는 로컬 프록시를 HTTPS_PROXY로 넣어
// 패키징 앱의 첫 실행 환경 구성(uv)이 매달리게 하고, 준비 화면이 무엇을 보여주는지 본다.
// 임시 HOME(모델 폴더만 링크)을 쓰며 실제 사용자 데이터는 건드리지 않는다.
import { createServer } from 'node:net'
import { mkdirSync, mkdtempSync, symlinkSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'

const { _electron: electron } = await import(process.env.PW_CORE ?? 'playwright-core')
const EXE = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/mac-arm64/thebooth.app/Contents/MacOS/thebooth'
const SHOTS = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/first-run-stall/screens'
mkdirSync(SHOTS, { recursive: true })

const sockets = new Set()
const proxy = createServer((socket) => { sockets.add(socket); socket.on('error', () => {}) })
await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve))
const proxyUrl = `http://127.0.0.1:${proxy.address().port}`

const home = mkdtempSync(join(tmpdir(), 'booth-stall-home-'))
const data = join(home, 'Library/Application Support/thebooth')
mkdirSync(data, { recursive: true })
symlinkSync(join(homedir(), 'Library/Application Support/thebooth/models'), join(data, 'models'))
// STALL_PROXY=0이면 프록시 없이 정상 첫 실행에서 오탐(정지 안내)이 뜨는지만 본다
const useProxy = process.env.STALL_PROXY !== '0'
const env = useProxy ? { ...process.env, HOME: home, HTTPS_PROXY: proxyUrl, HTTP_PROXY: proxyUrl, https_proxy: proxyUrl, http_proxy: proxyUrl } : { ...process.env, HOME: home }
for (const key of Object.keys(env)) if (key.startsWith('UV_') || key === 'VIRTUAL_ENV' || key.startsWith('THEBOOTH_')) delete env[key]

const app = await electron.launch({ executablePath: EXE, args: [], env })
const page = await app.firstWindow()
await app.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0]?.setContentSize(1100, 900) })
const started = Date.now()
const seconds = () => Math.round((Date.now() - started) / 1000)
let outcome = 'timeout'
let sawStall = false
for (;;) {
  const text = await page.locator('body').innerText()
  if (text.includes('진행 신호가 없습니다')) { sawStall = true; if (useProxy) { outcome = 'stall'; break } }
  if (/실패|다시 시도/.test(text) && !text.includes('설치하는 중')) { outcome = 'failed'; break }
  if (text.includes('곡 보관함')) { outcome = 'ready'; break }
  if (seconds() > (useProxy ? 10 : 40) * 60) break
  await page.waitForTimeout(5000)
}
console.log(`결과 ${outcome} (${seconds()}초), 프록시 ${useProxy ? sockets.size + '개 연결' : '없음'}, 정지 안내 표시 ${sawStall}`)
await page.screenshot({ path: `${SHOTS}/${useProxy ? '1' : '0-normal'}-${outcome}.png`, fullPage: true })
console.log((await page.locator('main').innerText()).slice(0, 800))
if (outcome === 'stall') {
  // 프록시를 끊으면 uv 연결이 실패하고 '취소 후 다시 시도'로 재시작되는지 — 버튼만 눌러 상태 전환 확인
  await page.getByRole('button', { name: '취소 후 다시 시도' }).click()
  await page.waitForTimeout(8000)
  console.log('다시 시도 후:', (await page.locator('main').innerText()).slice(0, 300))
  await page.screenshot({ path: `${SHOTS}/2-after-retry.png`, fullPage: true })
}
await app.close()
for (const socket of sockets) socket.destroy()
proxy.close()
