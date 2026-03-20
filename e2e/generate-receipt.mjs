import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateReceipt() {
  const browser = await chromium.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, 'fixtures/generate-receipt.html');
  await page.goto(`file://${htmlPath}`);
  const receipt = page.locator('#receipt');
  await receipt.screenshot({ path: path.resolve(__dirname, 'fixtures/receipt.png') });
  await browser.close();
  console.log('Receipt PNG generated at e2e/fixtures/receipt.png');
}

generateReceipt();
