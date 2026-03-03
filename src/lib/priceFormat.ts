const CRC_RATE = 500;

export function formatDualPrice(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} o $${usd.toFixed(2)}`;
}

export function formatDualPriceInt(usd: number): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} o $${usd}`;
}
