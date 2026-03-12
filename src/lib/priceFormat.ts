const CRC_RATE = 500;

function formatCRC(colones: number): string {
  return colones.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDualPrice(usd: number, connector: string = 'ó'): string {
  const colones = usd * CRC_RATE;
  return `₡${formatCRC(colones)} ${connector} $${usd.toFixed(2)}`;
}

export function formatDualPriceInt(usd: number, connector: string = 'ó'): string {
  const colones = usd * CRC_RATE;
  return `₡${formatCRC(colones)} ${connector} $${usd}`;
}
