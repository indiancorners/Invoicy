const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const themes = ['minimalist', 'corporate', 'retro', 'clean', 'modern'];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 1300 });

  for (const theme of themes) {
    const file = path.resolve(__dirname, `preview-${theme}.html`);
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const el = await page.$('.page');
    await el.screenshot({ path: path.resolve(__dirname, `preview-${theme}.png`) });
    console.log('Done:', theme);
  }
  await browser.close();
  console.log('All screenshots captured.');
})().catch(e => { console.error(e); process.exit(1); });
