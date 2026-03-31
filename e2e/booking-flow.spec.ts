/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, Locator } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RECEIPT_PATH = path.resolve(__dirname, 'fixtures/receipt.png');

const SUPABASE_HOST = 'yvmzzgphvfvaovlmmjsa.supabase.co';

// Booking config: 3 adults, 2 nights, own tent → total = 3 × $14 × 2 = $84 USD
// Deposit = $42 USD = ₡21,000 CRC
// Receipt ₡40,000 is between ₡21,000 (100%) and ₡42,000 (200%) → valid

/**
 * Helper: Set a React controlled input value via __reactProps$ fiber.
 */
async function setReactInput(locator: Locator, value: string) {
  await locator.evaluate((el: HTMLInputElement, val: string) => {
    const propsKey = Object.keys(el).find(k => k.startsWith('__reactProps$'))!;
    const props = (el as any)[propsKey];
    if (props?.onChange) {
      props.onChange({ target: { value: val } });
    }
  }, value);
}

async function triggerReactBlur(locator: Locator) {
  await locator.evaluate((el: HTMLInputElement) => {
    const propsKey = Object.keys(el).find(k => k.startsWith('__reactProps$'))!;
    const props = (el as any)[propsKey];
    if (props?.onBlur) {
      props.onBlur();
    }
  });
}

/**
 * Helper: Click a React button via its fiber onClick prop.
 */
async function reactClick(locator: Locator) {
  await locator.evaluate((el: HTMLElement) => {
    let node: HTMLElement | null = el;
    while (node) {
      const propsKey = Object.keys(node).find(k => k.startsWith('__reactProps$'));
      if (propsKey) {
        const props = (node as any)[propsKey];
        if (props?.onClick) {
          props.onClick({ preventDefault: () => {}, stopPropagation: () => {}, currentTarget: el, target: el });
          return;
        }
      }
      node = node.parentElement;
    }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

test.describe('Full Booking Flow E2E', () => {

  test('shows no-availability popup when camping is full and navigates to dates', async ({ page }) => {
    // Block external fonts
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());

    // Mock Supabase REST API — camping full (capacity 10, 10 already booked)
    await page.route(`**/${SUPABASE_HOST}/rest/v1/**`, route => {
      const url = route.request().url();

      if (url.includes('camping_settings')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ key: 'max_capacity_persons', value: '10' }),
        });
      }

      if (url.includes('bookings')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ adults: 8, children: 2 }]),
        });
      }

      return route.continue();
    });

    // ─── Navigate to booking page ───
    await page.goto('/book', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('button:has-text("Continuar")', { timeout: 30_000 });

    // ─── STEP 1: Select Dates ───
    const checkInInput = page.locator('input[placeholder="DD/MM/AAAA"]').first();
    await setReactInput(checkInInput, '10/04/2026');
    await page.waitForTimeout(100);
    await triggerReactBlur(checkInInput);
    await page.waitForTimeout(500);

    const checkOutInput = page.locator('input[placeholder="DD/MM/AAAA"]').nth(1);
    await expect(checkOutInput).toBeEnabled({ timeout: 5000 });
    await setReactInput(checkOutInput, '12/04/2026');
    await page.waitForTimeout(100);
    await triggerReactBlur(checkOutInput);
    await page.waitForTimeout(500);

    await expect(page.locator('text=/2\\s+noche/i')).toBeVisible({ timeout: 5000 });
    const continueToGuests = page.getByRole('button', { name: /^Continuar$/i });
    await expect(continueToGuests).toBeEnabled({ timeout: 5000 });
    await reactClick(continueToGuests);

    // ─── STEP 2: Select Guests and trigger availability check ───
    await page.waitForSelector('button:has-text("Continuar")', { timeout: 10_000 });

    const guestCard = page.locator('.card-nature').first();
    const adultPlus = guestCard.locator('button[class*="rounded-full"]').nth(1);
    await reactClick(adultPlus);
    await page.waitForTimeout(200);

    const continueBtn = page.getByRole('button', { name: /^Continuar$/i });
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    await reactClick(continueBtn);

    // ─── Verify no-availability popup appears ───
    await expect(page.locator('text=/Sin disponibilidad/i')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=/capacidad máxima/i')).toBeVisible({ timeout: 5000 });

    console.log('✅ No-availability popup displayed correctly');

    // ─── Click "Cambiar fechas" button ───
    const changeDatesBtn = page.getByRole('button', { name: /Cambiar fechas/i });
    await expect(changeDatesBtn).toBeVisible({ timeout: 5000 });
    await reactClick(changeDatesBtn);
    await page.waitForTimeout(500);

    // ─── Verify we're back at Step 1 (date selection) ───
    await expect(page.locator('input[placeholder="DD/MM/AAAA"]').first()).toBeVisible({ timeout: 10_000 });
    console.log('✅ Navigated back to Step 1 (dates) after clicking "Cambiar fechas"');
  });

  test('complete booking: dates → guests → summary → payment → confirmation', async ({ page }) => {
    // Block external fonts
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());

    // ─── Mock Supabase API calls ───
    const MOCK_REF_CODE = 'CPVC-E2ETS';

    // Mock Supabase REST API (capacity check: camping_settings + bookings)
    await page.route(`**/${SUPABASE_HOST}/rest/v1/**`, route => {
      const url = route.request().url();

      if (url.includes('camping_settings')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ key: 'max_capacity_persons', value: '100' }),
        });
      }

      if (url.includes('bookings')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }

      // RPC calls (link_payment_receipt, update_booking_deposit)
      if (url.includes('/rpc/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }

      return route.continue();
    });

    // Mock Supabase Storage upload
    await page.route(`**/${SUPABASE_HOST}/storage/v1/object/**`, route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Key: 'payment-receipts/mock-receipt.png' }),
      });
    });

    // Mock create-booking edge function
    await page.route(`**/${SUPABASE_HOST}/functions/v1/create-booking`, route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ referenceCode: MOCK_REF_CODE }),
      });
    });

    // ─── Navigate to booking page ───
    await page.goto('/book', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('button:has-text("Continuar")', { timeout: 30_000 });

    // ─── STEP 1: Select Dates ───
    const checkInInput = page.locator('input[placeholder="DD/MM/AAAA"]').first();
    await setReactInput(checkInInput, '10/04/2026');
    await page.waitForTimeout(100);
    await triggerReactBlur(checkInInput);
    await page.waitForTimeout(500);

    const checkOutInput = page.locator('input[placeholder="DD/MM/AAAA"]').nth(1);
    await expect(checkOutInput).toBeEnabled({ timeout: 5000 });
    await setReactInput(checkOutInput, '12/04/2026');
    await page.waitForTimeout(100);
    await triggerReactBlur(checkOutInput);
    await page.waitForTimeout(500);

    await expect(page.locator('text=/2\\s+noche/i')).toBeVisible({ timeout: 5000 });
    const continueToGuests = page.getByRole('button', { name: /^Continuar$/i });
    await expect(continueToGuests).toBeEnabled({ timeout: 5000 });
    console.log('✅ Step 1: Dates selected (Apr 10-12, 2 nights)');
    await reactClick(continueToGuests);

    // ─── STEP 2: Select Guests ───
    await page.waitForSelector('button:has-text("Continuar")', { timeout: 10_000 });

    const guestCard = page.locator('.card-nature').first();
    const adultPlus = guestCard.locator('button[class*="rounded-full"]').nth(1);
    await reactClick(adultPlus);
    await page.waitForTimeout(200);
    await reactClick(adultPlus);
    await page.waitForTimeout(200);
    await reactClick(adultPlus);
    await page.waitForTimeout(200);

    const continueToExtras = page.getByRole('button', { name: /^Continuar$/i });
    await expect(continueToExtras).toBeEnabled({ timeout: 5000 });
    console.log('✅ Step 2: 3 adults, own tent');
    await reactClick(continueToExtras);

    // ─── STEP 3: Summary + Guest Info ───
    await page.waitForSelector('button:has-text("Continuar")', { timeout: 10_000 });

    await expect(page.getByText('$84.00').first()).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder('Tu Nombre').fill('Maria');
    await page.getByPlaceholder('Tus Apellidos').fill('Garcia Test');
    await page.getByPlaceholder('juan@ejemplo.com').fill('maria.garcia.e2etest@example.com');
    await page.getByPlaceholder('8888-8888').fill('88881234');

    // Select country via searchable combobox
    await page.getByRole('combobox').filter({ hasText: 'Selecciona tu país' }).click();
    await page.getByRole('option', { name: 'Costa Rica' }).click();

    const confirmAndPay = page.getByRole('button', { name: /^Continuar$/i });
    console.log('✅ Step 3: Summary verified ($84.00), guest info filled');
    await reactClick(confirmAndPay);

    // ─── STEP 4: Payment ───
    await page.waitForSelector('text=Completar Reserva', { timeout: 10_000 });

    await expect(page.getByText('$84.00').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$42.00').first()).toBeVisible({ timeout: 5000 });

    // Upload receipt
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(RECEIPT_PATH);

    // Wait for upload to trigger verifying state
    await expect(page.locator('text=/Verificando/i')).toBeVisible({ timeout: 10_000 });

    // Bypass OCR (no external network for Tesseract language data).
    // Walk UP the fiber tree from the spinner to find and patch the component state.
    await page.evaluate(() => {
      const spinner = document.querySelector('svg.animate-spin');
      if (!spinner) return;
      let el: Element | null = spinner;
      let fiberKey = '';
      while (el) {
        fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$')) || '';
        if (fiberKey) break;
        el = el.parentElement;
      }
      if (!fiberKey || !el) return;
      let fiber = (el as any)[fiberKey];
      for (let depth = 0; fiber && depth < 50; depth++, fiber = fiber.return) {
        let hook = fiber.memoizedState;
        while (hook) {
          if (hook.memoizedState === 'verifying' && hook.queue?.dispatch) {
            hook.queue.dispatch('verified');
          }
          hook = hook.next;
        }
        if (fiber.memoizedProps?.onVerified) {
          fiber.memoizedProps.onVerified(true, 40000);
          break;
        }
      }
    });
    await page.waitForTimeout(500);

    await expect(page.locator('text=/verificado/i')).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 4: Receipt verification passed (OCR bypassed - no external network)');

    // Accept terms checkbox
    const termsCheckbox = page.locator('#terms');
    await reactClick(termsCheckbox);
    await page.waitForTimeout(300);

    // Click "Completar Reserva"
    const completeBooking = page.getByRole('button', { name: /Completar Reserva/i });
    await expect(completeBooking).toBeEnabled({ timeout: 5000 });
    await reactClick(completeBooking);

    // ─── CONFIRMATION ───
    await expect(page.getByText(MOCK_REF_CODE).first()).toBeVisible({ timeout: 30_000 });

    console.log(`✅ Booking confirmed! Reference: ${MOCK_REF_CODE}`);
    console.log('✅ Full E2E booking flow completed successfully!');
  });
});
