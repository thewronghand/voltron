// r1: 패키징 앱이 열리고 화면 출처·제목·부제가 맞는지
import { launch, shot } from './launch.mjs'
const { app, page, home } = await launch()
console.log('HOME', home)
await page.waitForLoadState('domcontentloaded')
await page.waitForTimeout(2000)
console.log('url', page.url(), 'title', await page.title())
console.log('name', await app.evaluate(({ app }) => [app.getName(), app.getPath('userData')]))
console.log((await page.locator('body').innerText()).slice(0, 400))
await shot(page, 'r1-open')
await page.setViewportSize({ width: 720, height: 600 })
console.log('scrollWidth@720', await page.evaluate(() => document.documentElement.scrollWidth))
await shot(page, 'r1-open-720')
await app.close()
