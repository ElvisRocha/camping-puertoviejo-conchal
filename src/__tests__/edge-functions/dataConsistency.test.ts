import { describe, it, expect } from 'vitest';
import { PRICING, TENT_OPTIONS, ADD_ONS } from '@/types/booking';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read both edge function sources
const createBookingSrc = readFileSync(
  resolve(__dirname, '../../../supabase/functions/create-booking/index.ts'),
  'utf-8'
);
const updateBookingSrc = readFileSync(
  resolve(__dirname, '../../../supabase/functions/update-booking/index.ts'),
  'utf-8'
);

function extractTentPrices(source: string): Record<string, number> {
  const prices: Record<string, number> = {};
  const regex = /\{\s*id:\s*'(tent-\d+)',\s*pricePerNight:\s*(\d+)\s*\}/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    prices[match[1]] = parseInt(match[2]);
  }
  return prices;
}

function extractAddonPrices(source: string): Record<string, number> {
  const prices: Record<string, number> = {};
  const regex = /\{\s*id:\s*'([^']+)',\s*price:\s*(\d+)\s*\}/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    prices[match[1]] = parseInt(match[2]);
  }
  return prices;
}

const CRC_RATE = 500;

describe('Frontend ↔ Backend Data Consistency', () => {
  const createTentPrices = extractTentPrices(createBookingSrc);
  const createAddonPrices = extractAddonPrices(createBookingSrc);
  const updateTentPrices = extractTentPrices(updateBookingSrc);
  const updateAddonPrices = extractAddonPrices(updateBookingSrc);

  // --- Price parity: frontend vs create-booking ---

  it('PR-13: tent prices match between frontend and create-booking', () => {
    for (const tent of TENT_OPTIONS) {
      const edgePrice = createTentPrices[tent.id];
      expect(edgePrice, `create-booking missing tent ${tent.id}`).toBeDefined();
      expect(edgePrice, `Tent ${tent.id}: frontend=$${tent.pricePerNight}, edge=$${edgePrice}`).toBe(tent.pricePerNight);
    }
    // PRICING.tents must match TENT_OPTIONS
    for (const [id, price] of Object.entries(PRICING.tents)) {
      const tentOption = TENT_OPTIONS.find((t) => t.id === id);
      expect(price, `PRICING.tents[${id}] should match TENT_OPTIONS`).toBe(tentOption?.pricePerNight);
    }
  });

  it('PR-14: add-on IDs and prices match between frontend and create-booking', () => {
    const frontendIds = ADD_ONS.map((a) => a.id).sort();
    const edgeIds = Object.keys(createAddonPrices).sort();

    for (const id of frontendIds) {
      expect(edgeIds, `create-booking missing add-on "${id}"`).toContain(id);
    }
    for (const addon of ADD_ONS) {
      const edgePrice = createAddonPrices[addon.id];
      if (edgePrice !== undefined) {
        expect(edgePrice, `Add-on ${addon.id}: frontend=$${addon.price}, edge=$${edgePrice}`).toBe(addon.price);
      }
    }
    for (const id of edgeIds) {
      expect(frontendIds, `create-booking has extra add-on "${id}"`).toContain(id);
    }
  });

  // --- Price parity: frontend vs update-booking ---

  it('update-booking tent prices match frontend', () => {
    for (const tent of TENT_OPTIONS) {
      const edgePrice = updateTentPrices[tent.id];
      expect(edgePrice, `update-booking missing tent ${tent.id}`).toBeDefined();
      expect(edgePrice, `Tent ${tent.id}: frontend=$${tent.pricePerNight}, update=$${edgePrice}`).toBe(tent.pricePerNight);
    }
  });

  it('update-booking add-on IDs and prices match frontend', () => {
    const frontendIds = ADD_ONS.map((a) => a.id).sort();
    const edgeIds = Object.keys(updateAddonPrices).sort();

    for (const id of frontendIds) {
      expect(edgeIds, `update-booking missing add-on "${id}"`).toContain(id);
    }
    for (const addon of ADD_ONS) {
      const edgePrice = updateAddonPrices[addon.id];
      if (edgePrice !== undefined) {
        expect(edgePrice, `Add-on ${addon.id}: frontend=$${addon.price}, update=$${edgePrice}`).toBe(addon.price);
      }
    }
    for (const id of edgeIds) {
      expect(frontendIds, `update-booking has extra add-on "${id}"`).toContain(id);
    }
  });

  // --- Both edge functions must be in sync ---

  it('create-booking and update-booking have identical tent prices', () => {
    expect(createTentPrices).toEqual(updateTentPrices);
  });

  it('create-booking and update-booking have identical add-on prices', () => {
    expect(createAddonPrices).toEqual(updateAddonPrices);
  });

  // --- CRC storage: prices must be multiplied by CRC_RATE before insert ---

  it('create-booking stores tent price_per_night in CRC (× CRC_RATE)', () => {
    // Verify the source contains multiplication by CRC_RATE for price_per_night
    expect(
      createBookingSrc,
      'create-booking must multiply price_per_night by CRC_RATE'
    ).toMatch(/price_per_night:\s*\(?tent\?\.pricePerNight\s*\?\?\s*0\)?\s*\*\s*CRC_RATE/);
  });

  it('create-booking stores addon price in CRC (× CRC_RATE)', () => {
    expect(
      createBookingSrc,
      'create-booking must multiply addon price by CRC_RATE'
    ).toMatch(/price:\s*\(?addon\?\.price\s*\?\?\s*0\)?\s*\*\s*CRC_RATE/);
  });

  it('update-booking stores tent price_per_night in CRC (× CRC_RATE)', () => {
    expect(
      updateBookingSrc,
      'update-booking must multiply price_per_night by CRC_RATE'
    ).toMatch(/price_per_night:\s*\(?tent\?\.pricePerNight\s*\?\?\s*0\)?\s*\*\s*CRC_RATE/);
  });

  it('update-booking stores addon price in CRC (× CRC_RATE)', () => {
    expect(
      updateBookingSrc,
      'update-booking must multiply addon price by CRC_RATE'
    ).toMatch(/price:\s*\(?addon\?\.price\s*\?\?\s*0\)?\s*\*\s*CRC_RATE/);
  });

  // --- bookings table amounts stored in CRC ---

  it('create-booking stores all booking fees in CRC (× CRC_RATE)', () => {
    expect(createBookingSrc).toMatch(/campsite_fee:\s*Math\.round\(pricing\.campsiteFee\s*\*\s*CRC_RATE\)/);
    expect(createBookingSrc).toMatch(/tent_rental_fee:\s*Math\.round\(pricing\.tentRental\s*\*\s*CRC_RATE\)/);
    expect(createBookingSrc).toMatch(/addons_fee:\s*Math\.round\(pricing\.addOns\s*\*\s*CRC_RATE\)/);
  });

  it('update-booking stores all booking fees in CRC (× 500)', () => {
    expect(updateBookingSrc).toMatch(/campsite_fee:\s*Math\.round\(pricing\.campsiteFee\s*\*\s*500\)/);
    expect(updateBookingSrc).toMatch(/tent_rental_fee:\s*Math\.round\(pricing\.tentRental\s*\*\s*500\)/);
    expect(updateBookingSrc).toMatch(/addons_fee:\s*Math\.round\(pricing\.addOns\s*\*\s*500\)/);
  });
});
