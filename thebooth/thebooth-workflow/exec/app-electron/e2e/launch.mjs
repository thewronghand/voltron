// 검증용: 실행 중인 electron-vite 개발 서버의 렌더러로 실제 Electron 앱을 띄운다.
import { _electron as electron } from 'playwright-core'
import { createRequire } from 'node:module'
import { mkdtempSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join } from 'node:path'

const APP = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app'
const SHOTS = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/app-electron/screens'
const require = createRequire(join(APP, 'package.json'))
const electronPath = require('electron')

export async function launch({ freshHome = false } = {}) {
  const env = { ...process.env, ELECTRON_RENDERER_URL: 'http://127.0.0.1:5173' }
  if (freshHome) {
    env.HOME = mkdtempSync(join(tmpdir(), 'booth-home-'))
    env.UV_CACHE_DIR = join(homedir(), '.cache/uv')
  }
  const app = await electron.launch({ executablePath: electronPath, args: ['.'], cwd: APP, env })
  app.process().stdout?.on('data', (d) => process.stdout.write(`[main] ${d}`))
  app.process().stderr?.on('data', (d) => process.stdout.write(`[main!] ${d}`))
  const page = await app.firstWindow()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()) })
  await page.setViewportSize({ width: 1100, height: 900 }).catch(() => {})
  return { app, page, home: env.HOME }
}

export const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
