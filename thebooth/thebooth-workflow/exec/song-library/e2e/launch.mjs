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

export function makeHome() {
  const home = mkdtempSync(join(tmpdir(), 'booth-lib-home-'))
  const data = join(home, 'Library/Application Support/thebooth')
  mkdirSync(data, { recursive: true })
  mkdirSync(join(home, 'Library/Caches'), { recursive: true })
  symlinkSync(join(homedir(), 'Library/Application Support/thebooth/models'), join(data, 'models'))
  symlinkSync(join(homedir(), 'Library/Caches/thebooth'), join(home, 'Library/Caches/thebooth'))
  return home
}

export async function launch({ home }) {
  const server = await serveRenderer()
  const url = `http://127.0.0.1:${server.address().port}`
  const env = { ...process.env, HOME: home, ELECTRON_RENDERER_URL: url, UV_CACHE_DIR: join(homedir(), '.cache/uv') }
  const app = await electron.launch({ executablePath: electronPath, args: ['.'], cwd: APP, env })
  app.process().stderr?.on('data', (d) => { if (/Error|Traceback/.test(String(d))) process.stdout.write(`[main!] ${d}`) })
  const page = await app.firstWindow()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()) })
  await page.setViewportSize({ width: 1100, height: 900 }).catch(() => {})
  const close = async () => { await app.close(); server.close() }
  return { app, page, close }
}

export const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
