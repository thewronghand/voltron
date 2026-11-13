// 검증용: 패키징한 thebooth.app을 임시 HOME(빈 사용자 데이터)으로 띄운다.
// playwright-core는 스크래치에 설치한 것을 PW_CORE 환경변수로 가리킨다.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const { _electron: electron } = await import(process.env.PW_CORE ?? 'playwright-core')
const EXE = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/mac-arm64/thebooth.app/Contents/MacOS/thebooth'
const SHOTS = '/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/app-packaging/screens'

export async function launch({ home } = {}) {
  const env = { ...process.env, HOME: home ?? mkdtempSync(join(tmpdir(), 'booth-pkg-home-')) }
  for (const key of Object.keys(env)) if (key.startsWith('UV_') || key === 'VIRTUAL_ENV' || key.startsWith('THEBOOTH_')) delete env[key]
  const app = await electron.launch({ executablePath: EXE, args: [], env })
  app.process().stdout?.on('data', (d) => process.stdout.write(`[main] ${d}`))
  app.process().stderr?.on('data', (d) => process.stdout.write(`[main!] ${d}`))
  const page = await app.firstWindow()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()) })
  await page.setViewportSize({ width: 1100, height: 900 }).catch(() => {})
  return { app, page, home: env.HOME }
}

export const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
