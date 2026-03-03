const CRC_RATE = 500;

export function formatDualPrice(usd: number, connector: string = 'ó'): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} ${connector} $${usd.toFixed(2)}`;
}

export function formatDualPriceInt(usd: number, connector: string = 'ó'): string {
  const colones = Math.round(usd * CRC_RATE);
  return `₡${colones.toLocaleString()} ${connector} $${usd}`;
}
