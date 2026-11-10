// Matka Utility & Game Rules for Admin Frontend

export function calculateAnkFromPanna(panna: string): string {
  if (!panna || panna.length !== 3) return '';
  const sum = parseInt(panna[0], 10) + parseInt(panna[1], 10) + parseInt(panna[2], 10);
  return (sum % 10).toString();
}

export function formatMatkaResult(
  openPanna: string | null,
  openDigit: string | null,
  closeDigit: string | null,
  closePanna: string | null
): string {
  const op = openPanna ? openPanna : '***';
  const od = openDigit !== null && openDigit !== undefined && openDigit !== '' ? openDigit : '*';
  const cd = closeDigit !== null && closeDigit !== undefined && closeDigit !== '' ? closeDigit : '*';
  const cp = closePanna ? closePanna : '***';

  return `${op}-${od}${cd}-${cp}`;
}
