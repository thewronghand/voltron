// 검증용: 빌드한 렌더러(out/renderer)를 로컬 정적 서버로 띄우고 개발 모드 Electron을 임시 HOME으로 실행한다.
// 모델·분리 캐시는 실제 폴더를 링크로 연결한다(곡 보관함·Electron 데이터는 임시 HOME 안에만 생긴다).
// playwright-core는 스크래치에 설치한 것을 PW_CORE 환경변수로 가리킨다.
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, existsSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { extname, join, normalize } from 'node:path'

const { _electron: electron } = await import(process.env.PW_CORE ?? 'playwright-core')
const APP = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app'
const SHOTS = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/song-library/screens'
const require = createRequire(join(APP, 'package.json'))
const electronPath = require('electron')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

function serveRenderer() {
  const root = join(APP, 'out/renderer')
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '') || 'index.html'
    const file = join(root, path)
    if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404).end(); return }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

export const PACKAGED = process.env.BOOTH_PACKAGED === '1'
const PACKAGED_EXE = join(APP, 'dist/mac-arm64/thebooth.app/Contents/MacOS/thebooth')

export function makeHome() {
  const home = mkdtempSync(join(tmpdir(), 'booth-lib-home-'))
  const data = join(home, 'Library/Application Support/thebooth')
  mkdirSync(data, { recursive: true })
  mkdirSync(join(home, 'Library/Caches'), { recursive: true })
  symlinkSync(join(homedir(), 'Library/Application Support/thebooth/models'), join(data, 'models'))
  if (PACKAGED) {
    // 패키징 앱은 캐시 폴더에 uv 캐시(약 1GB)도 쓰므로 캐시 폴더 전체를 링크하지 않고
    // 분리·음표·정렬 캐시만 링크한다(실제 사용자 캐시에 uv가 쓰지 않게).
    const cache = join(home, 'Library/Caches/thebooth')
    mkdirSync(cache, { recursive: true })
    for (const name of ['separations', 'melody', 'alignment']) {
      const real = join(homedir(), 'Library/Caches/thebooth', name)
      if (existsSync(real)) symlinkSync(real, join(cache, name))
    }
  } else {
    symlinkSync(join(homedir(), 'Library/Caches/thebooth'), join(home, 'Library/Caches/thebooth'))
  }
  return home
}

async function launchPackaged(home) {
  const env = { ...process.env, HOME: home }
  for (const key of Object.keys(env)) if (key.startsWith('UV_') || key === 'VIRTUAL_ENV' || key.startsWith('THEBOOTH_') || key === 'ELECTRON_RENDERER_URL') delete env[key]
  const app = await electron.launch({ executablePath: PACKAGED_EXE, args: [], env })
  app.process().stderr?.on('data', (d) => { if (/Error|Traceback/.test(String(d))) process.stdout.write(`[main!] ${d}`) })
  const page = await app.firstWindow()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()) })
  await app.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0]?.setContentSize(1100, 900) })
  // 첫 실행: 실행 환경 구성(uv sync)이 끝나 곡 목록이 보일 때까지 기다린다
  const started = Date.now()
  await page.getByText('곡 보관함').first().waitFor({ timeout: 30 * 60_000 })
  console.log(`[패키징] 곡 보관함 표시까지 ${Math.round((Date.now() - started) / 1000)}초, 출처 ${page.url()}`)
  return { app, page, close: async () => { await app.close() } }
}

export async function launch({ home }) {
  if (PACKAGED) return launchPackaged(home)
  const server = await serveRenderer()
  const url = `http://127.0.0.1:${server.address().port}`
  const env = { ...process.env, HOME: home, ELECTRON_RENDERER_URL: url, UV_CACHE_DIR: join(homedir(), '.cache/uv') }
  const app = await electron.launch({ executablePath: electronPath, args: ['.'], cwd: APP, env })
  app.process().stderr?.on('data', (d) => { if (/Error|Traceback/.test(String(d))) process.stdout.write(`[main!] ${d}`) })
  const page = await app.firstWindow()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()) })
  // 뷰포트만 키우면 창(760px)보다 커져 아래쪽이 스크롤로 닿지 않는다 — 창 자체 크기를 바꾼다
  await app.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0]?.setContentSize(1100, 900) })
  const close = async () => { await app.close(); server.close() }
  return { app, page, close }
}

export const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
