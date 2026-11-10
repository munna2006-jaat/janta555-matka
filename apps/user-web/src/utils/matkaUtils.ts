// Matka Utility & Game Rules for Frontend

export const TRIPLE_PANNAS = [
  '000', '111', '222', '333', '444', '555', '666', '777', '888', '999'
];

export function getMatkaDigitValue(d: string): number {
  return d === '0' ? 10 : parseInt(d, 10);
}

export function generateAllSinglePannas(): string[] {
  const pannas: string[] = [];
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      for (let k = j + 1; k < digits.length; k++) {
        pannas.push(`${digits[i]}${digits[j]}${digits[k]}`);
      }
    }
  }
  return pannas;
}

export function generateAllDoublePannas(): string[] {
  const pannas: string[] = [];
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) {
        const arr = [digits[i], digits[i], digits[j]];
        arr.sort((a, b) => getMatkaDigitValue(a) - getMatkaDigitValue(b));
        const str = arr.join('');
        if (!pannas.includes(str)) {
          pannas.push(str);
        }
      }
    }
  }
  return pannas;
}

export const SINGLE_PANNAS = generateAllSinglePannas();
export const DOUBLE_PANNAS = generateAllDoublePannas();

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

export function generateSPMotor(selectedDigits: string[]): string[] {
  const unique = Array.from(new Set(selectedDigits));
  if (unique.length < 3) return [];
  const result: string[] = [];
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      for (let k = j + 1; k < unique.length; k++) {
        const combo = [unique[i], unique[j], unique[k]];
        combo.sort((a, b) => getMatkaDigitValue(a) - getMatkaDigitValue(b));
        const str = combo.join('');
        if (SINGLE_PANNAS.includes(str) && !result.includes(str)) {
          result.push(str);
        }
      }
    }
  }
  return result;
}

export function generateDPMotor(selectedDigits: string[]): string[] {
  const unique = Array.from(new Set(selectedDigits));
  if (unique.length < 2) return [];
  const result: string[] = [];
  for (let i = 0; i < unique.length; i++) {
    for (let j = 0; j < unique.length; j++) {
      if (i !== j) {
        const combo = [unique[i], unique[i], unique[j]];
        combo.sort((a, b) => getMatkaDigitValue(a) - getMatkaDigitValue(b));
        const str = combo.join('');
        if (DOUBLE_PANNAS.includes(str) && !result.includes(str)) {
          result.push(str);
        }
      }
    }
  }
  return result;
}
