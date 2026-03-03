const CRC_RATE = 500;

export function formatDualPrice(usd: number, separator = 'o'): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} ${separator} $${usd.toFixed(2)}`;
}

export function formatDualPriceInt(usd: number, separator = 'o'): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} ${separator} $${usd}`;
}
