import { describe, it, expect } from 'vitest';
import { PRICING, TENT_OPTIONS, ADD_ONS } from '@/types/booking';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read the edge function source to extract its pricing constants
const edgeFunctionSource = readFileSync(
  resolve(__dirname, '../../../supabase/functions/create-booking/index.ts'),
  'utf-8'
);

function extractEdgeTentPrices(source: string): Record<string, number> {
  const prices: Record<string, number> = {};
  const tentRegex = /\{\s*id:\s*'(tent-\d+)',\s*pricePerNight:\s*(\d+)\s*\}/g;
  let match;
  while ((match = tentRegex.exec(source)) !== null) {
    prices[match[1]] = parseInt(match[2]);
  }
  return prices;
}

function extractEdgeAddOnPrices(source: string): Record<string, number> {
  const prices: Record<string, number> = {};
  const addonRegex = /\{\s*id:\s*'([^']+)',\s*price:\s*(\d+)\s*\}/g;
  let match;
  while ((match = addonRegex.exec(source)) !== null) {
    prices[match[1]] = parseInt(match[2]);
  }
  return prices;
}

describe('Frontend ↔ Backend Data Consistency', () => {
  const edgeTentPrices = extractEdgeTentPrices(edgeFunctionSource);
  const edgeAddonPrices = extractEdgeAddOnPrices(edgeFunctionSource);

  // PR-13: Tent prices must match
  it('PR-13: tent prices match between frontend and edge function', () => {
    const frontendTentPrices: Record<string, number> = {};
    for (const tent of TENT_OPTIONS) {
      frontendTentPrices[tent.id] = tent.pricePerNight;
    }

    // Also check PRICING.tents
    for (const [id, price] of Object.entries(PRICING.tents)) {
      expect(price, `PRICING.tents[${id}] should match TENT_OPTIONS`).toBe(frontendTentPrices[id]);
    }

    // Frontend vs Edge Function
    for (const [id, frontendPrice] of Object.entries(frontendTentPrices)) {
      const edgePrice = edgeTentPrices[id];
      expect(edgePrice, `Edge function missing tent ${id}`).toBeDefined();
      expect(edgePrice, `Tent ${id}: frontend=$${frontendPrice}, edge=$${edgePrice}`).toBe(frontendPrice);
    }
  });

  // PR-14: Add-on prices and IDs must match
  it('PR-14: add-on IDs and prices match between frontend and edge function', () => {
    const frontendAddonIds = ADD_ONS.map((a) => a.id).sort();
    const edgeAddonIds = Object.keys(edgeAddonPrices).sort();

    // All frontend add-ons should exist in edge function
    for (const id of frontendAddonIds) {
      expect(edgeAddonIds, `Edge function missing add-on "${id}"`).toContain(id);
    }

    // Prices should match for shared add-ons
    for (const addon of ADD_ONS) {
      const edgePrice = edgeAddonPrices[addon.id];
      if (edgePrice !== undefined) {
        expect(edgePrice, `Add-on ${addon.id}: frontend=$${addon.price}, edge=$${edgePrice}`).toBe(addon.price);
      }
    }

    // Edge function should not have add-ons not in frontend
    for (const id of edgeAddonIds) {
      expect(frontendAddonIds, `Edge function has extra add-on "${id}" not in frontend`).toContain(id);
    }
  });
});
