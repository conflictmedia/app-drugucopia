const { chromium } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

const evidenceDir = path.join(__dirname, '..', '.omo', 'evidence', 'visual-qa', 'web')
fs.mkdirSync(evidenceDir, { recursive: true })

const pages = [
  { path: '/', name: 'home' },
  { path: '/calculators', name: 'calculators' },
  { path: '/calculators/benzo-equivalence', name: 'benzo-equivalence' },
  { path: '/interactions', name: 'interactions' },
  { path: '/dose-log', name: 'dose-log' },
  { path: '/custom-substances', name: 'custom-substances' },
  { path: '/harm-reduction', name: 'harm-reduction' },
]

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1280, height: 800 },
]

async function capture() {
  const browser = await chromium.launch()
  
  for (const pageConfig of pages) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: vp })
      const page = await context.newPage()
      
      try {
        await page.goto(`http://localhost:3000${pageConfig.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })
        
        // Wait for any lazy content to settle
        await page.waitForTimeout(500)
        
        const fileName = `${pageConfig.name}-${vp.name}.png`
        const filePath = path.join(evidenceDir, fileName)
        
        await page.screenshot({ 
          path: filePath,
          fullPage: false,
        })
        
        console.log(`Captured: ${fileName}`)
      } catch (e) {
        console.error(`Failed ${pageConfig.path} @ ${vp.name}:`, e.message)
      } finally {
        await context.close()
      }
    }
  }
  
  await browser.close()
}

capture().catch(console.error)
