import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import os from 'os';

puppeteer.use(StealthPlugin());

const CHROME_PATH = os.homedir() + '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
  ],
});

const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
await page.setViewport({ width: 1280, height: 800 });

await page.goto('https://smailpro.com/temporary-email', { waitUntil: 'load', timeout: 30000 });
await new Promise(r => setTimeout(r, 5000));

const text = await page.evaluate(() => document.body.textContent);
console.log('Has @melbourne:', text.includes('@melbourne'));
console.log('Has turnstile:', text.toLowerCase().includes('turnstile'));

// Check if email was auto-created
const emailVal = await page.evaluate(() => {
  const el = document.querySelector('input[readonly]');
  return el ? el.value : null;
});
console.log('EMAIL:', emailVal);

// Check Alpine data
const alpineData = await page.evaluate(() => {
  const el = document.querySelector('[x-data]');
  if (el && el.__x) {
    const d = el.__x.$data;
    return JSON.stringify({ email: d.email, key: d.key });
  }
  // Try to access email function data differently
  return 'no x-data found';
});
console.log('Alpine:', alpineData);

// Try Turnstile execute
const hasTurnstile = await page.evaluate(() => typeof turnstile !== 'undefined');
console.log('Has turnstile global:', hasTurnstile);

if (hasTurnstile) {
  const token = await page.evaluate(async () => {
    try {
      const t = await turnstile.execute('0x4AAAAAAAGy16vxN3jRC-ec');
      return t || 'empty token';
    } catch(e) {
      return 'error: ' + e.message;
    }
  });
  console.log('Token:', String(token).substring(0, 100));
}

await page.screenshot({ path: '/tmp/puppeteer_stealth.png' });
console.log('Screenshot saved');
await browser.close();
