const CRC_RATE = 500;

export function formatDualPrice(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `$${usd.toFixed(2)} / ₡${colones.toLocaleString()}`;
}

export function formatDualPriceInt(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `$${usd} / ₡${colones.toLocaleString()}`;
}
