export type Complex = [number, number];

export function complex(real: number, imaginary: number = 0): Complex {
  return [real, imaginary];
}

export function add(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subtract(a: Complex, b: Complex): Complex {
  return [a[0] - b[0], a[1] - b[1]];
}

export function multiply(a: Complex, b: Complex): Complex {
  return [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0]
  ];
}

export function times(a: Complex, b: Complex): Complex {
  return multiply(a, b);
}

export function divide(a: Complex, b: Complex): Complex {
  const denominator = b[0] * b[0] + b[1] * b[1];
  if (denominator === 0) {
    throw new Error('Division by zero');
  }
  return [
    (a[0] * b[0] + a[1] * b[1]) / denominator,
    (a[1] * b[0] - a[0] * b[1]) / denominator
  ];
}

export function magnitude(z: Complex): number {
  return Math.sqrt(z[0] * z[0] + z[1] * z[1]);
}

export function phase(z: Complex): number {
  return Math.atan2(z[1], z[0]);
}

export function conjugate(z: Complex): Complex {
  return [z[0], -z[1]];
}

export function real(z: Complex): number {
  return z[0];
}

export function imaginary(z: Complex): number {
  return z[1];
}

export function formatComplex(z: Complex, precision: number = 3): string {
  const r = Number(z[0].toFixed(precision));
  const i = Number(z[1].toFixed(precision));
  
  if (i === 0) return r.toString();
  if (r === 0) return i === 1 ? 'i' : i === -1 ? '-i' : `${i}i`;
  
  const sign = i >= 0 ? '+' : '-';
  const absI = Math.abs(i);
  const iStr = absI === 1 ? 'i' : `${absI}i`;
  
  // Remove spaces to match original: "-1+i" not "-1 + i"
  return `${r}${sign}${iStr}`;
}

export function formatComplexCoefficient(z: Complex): string {
  const r = Number(z[0].toFixed(2));
  const i = Number(z[1].toFixed(2));
  
  if (i === 0) return r.toFixed(2);
  
  const sign = i >= 0 ? '+' : '';
  return `${r.toFixed(2)}${sign}${i.toFixed(2)}i`;
}