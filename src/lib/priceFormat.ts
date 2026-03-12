const CRC_RATE = 500;

function formatCRC(colones: number): string {
  const fixed = colones.toFixed(2);
  const [int, dec] = fixed.split('.');
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${intFormatted}.${dec}`;
}

export function formatDualPrice(usd: number, connector: string = 'ó'): string {
  const colones = usd * CRC_RATE;
  return `₡${formatCRC(colones)} ${connector} $${usd.toFixed(2)}`;
}

export function formatDualPriceInt(usd: number, connector: string = 'ó'): string {
  const colones = usd * CRC_RATE;
  return `₡${formatCRC(colones)} ${connector} $${usd}`;
}
