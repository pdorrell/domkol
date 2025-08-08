import { makeAutoObservable } from 'mobx';
import { Complex, formatComplexCoefficient } from '@/utils/complex';
import { ComplexFunction } from './ComplexFunction';

export class PolynomialFunction implements ComplexFunction {
  zeroes: Complex[];

  constructor(zeroes: Complex[]) {
    this.zeroes = [...zeroes];
    makeAutoObservable(this);
  }

  updateZero(index: number, newValue: Complex, _changing?: boolean): void {
    if (index >= 0 && index < this.zeroes.length) {
      // Always update the zero position immediately - the domain coloring canvas
      // will decide whether to repaint based on its own repaintContinuously setting
      this.zeroes[index] = newValue;
    }
  }

  // Create a closure function using Horner's method for maximum performance
  getFunction() {
    const n = this.zeroes.length;

    // Special case: empty polynomial returns constant 1
    if (n === 0) {
      return (_z: Complex): Complex => [1, 0];
    }

    // Expand polynomial from roots to coefficients
    // We'll compute coefficients of (z - r₁)(z - r₂)...(z - rₙ)
    // Which gives us z^n + c_{n-1}*z^{n-1} + ... + c_1*z + c_0

    // Initialize coefficients array: coeffs[i] stores coefficient of z^i
    // Start with (z - zeroes[0])
    const coeffs: Complex[] = new Array(n + 1);

    // Initialize with first root: (z - r₀) = z + (-r₀)
    coeffs[0] = [-this.zeroes[0][0], -this.zeroes[0][1]]; // constant term
    coeffs[1] = [1, 0]; // coefficient of z
    for (let i = 2; i <= n; i++) {
      coeffs[i] = [0, 0];
    }

    // Multiply by each subsequent (z - rᵢ)
    for (let i = 1; i < n; i++) {
      const root = this.zeroes[i];
      const negRoot: Complex = [-root[0], -root[1]];

      // Multiply current polynomial by (z - root)
      // Work backwards to avoid overwriting values we need
      for (let j = i + 1; j > 0; j--) {
        // New coefficient[j] = old coefficient[j-1] * 1 + old coefficient[j] * (-root)
        const oldCoeff = coeffs[j];
        const shiftedCoeff = coeffs[j - 1];

        // Complex multiplication: coeffs[j] * (-root)
        const prodReal = oldCoeff[0] * negRoot[0] - oldCoeff[1] * negRoot[1];
        const prodImag = oldCoeff[0] * negRoot[1] + oldCoeff[1] * negRoot[0];

        // Add the shifted coefficient
        coeffs[j] = [shiftedCoeff[0] + prodReal, shiftedCoeff[1] + prodImag];
      }

      // Update constant term: coeffs[0] = coeffs[0] * (-root)
      const c0 = coeffs[0];
      coeffs[0] = [
        c0[0] * negRoot[0] - c0[1] * negRoot[1],
        c0[0] * negRoot[1] + c0[1] * negRoot[0]
      ];
    }

    // Create a copy of coefficients to avoid closure over MobX observables
    const plainCoeffs: Complex[] = coeffs.map(c => [c[0], c[1]]);

    // Return function that uses Horner's method for evaluation
    // p(z) = (((...((z * 1 + c_{n-1})*z + c_{n-2})*z + ...)*z + c_1)*z + c_0)
    return (z: Complex): Complex => {
      // Start with leading coefficient (which is always 1 for monic polynomial)
      let resultReal = 1;
      let resultImag = 0;

      // Apply Horner's method: work from highest degree down
      for (let i = n - 1; i >= 0; i--) {
        // Multiply current result by z
        const tempReal = resultReal * z[0] - resultImag * z[1];
        const tempImag = resultReal * z[1] + resultImag * z[0];

        // Add coefficient
        resultReal = tempReal + plainCoeffs[i][0];
        resultImag = tempImag + plainCoeffs[i][1];
      }

      return [resultReal, resultImag];
    };
  }

  // Optimized allocation-free implementation using Horner's method
  getWriterFunction() {
    const n = this.zeroes.length;

    // Special case: empty polynomial returns constant 1
    if (n === 0) {
      return (_x: number, _y: number, result: Complex) => {
        result[0] = 1;
        result[1] = 0;
      };
    }

    // Expand polynomial from roots to coefficients (same as getFunction)
    const coeffs: Complex[] = new Array(n + 1);

    // Initialize with first root: (z - r₀) = z + (-r₀)
    coeffs[0] = [-this.zeroes[0][0], -this.zeroes[0][1]]; // constant term
    coeffs[1] = [1, 0]; // coefficient of z
    for (let i = 2; i <= n; i++) {
      coeffs[i] = [0, 0];
    }

    // Multiply by each subsequent (z - rᵢ)
    for (let i = 1; i < n; i++) {
      const root = this.zeroes[i];
      const negRoot: Complex = [-root[0], -root[1]];

      // Multiply current polynomial by (z - root)
      // Work backwards to avoid overwriting values we need
      for (let j = i + 1; j > 0; j--) {
        // New coefficient[j] = old coefficient[j-1] * 1 + old coefficient[j] * (-root)
        const oldCoeff = coeffs[j];
        const shiftedCoeff = coeffs[j - 1];

        // Complex multiplication: coeffs[j] * (-root)
        const prodReal = oldCoeff[0] * negRoot[0] - oldCoeff[1] * negRoot[1];
        const prodImag = oldCoeff[0] * negRoot[1] + oldCoeff[1] * negRoot[0];

        // Add the shifted coefficient
        coeffs[j] = [shiftedCoeff[0] + prodReal, shiftedCoeff[1] + prodImag];
      }

      // Update constant term: coeffs[0] = coeffs[0] * (-root)
      const c0 = coeffs[0];
      coeffs[0] = [
        c0[0] * negRoot[0] - c0[1] * negRoot[1],
        c0[0] * negRoot[1] + c0[1] * negRoot[0]
      ];
    }

    // Create a copy of coefficients to avoid closure over MobX observables
    const plainCoeffs: Complex[] = coeffs.map(c => [c[0], c[1]]);

    // Return optimized writer function that uses Horner's method
    return (x: number, y: number, result: Complex) => {
      // Start with leading coefficient (which is always 1 for monic polynomial)
      let resultReal = 1;
      let resultImag = 0;

      // Apply Horner's method: work from highest degree down
      for (let i = n - 1; i >= 0; i--) {
        // Multiply current result by z = (x + iy)
        const tempReal = resultReal * x - resultImag * y;
        const tempImag = resultReal * y + resultImag * x;

        // Add coefficient
        resultReal = tempReal + plainCoeffs[i][0];
        resultImag = tempImag + plainCoeffs[i][1];
      }

      result[0] = resultReal;
      result[1] = resultImag;
    };
  }

  get formula(): string {
    if (this.zeroes.length === 0) {
      return '1';
    }

    const factors = this.zeroes.map(zero => {
      if (zero[0] === 0 && zero[1] === 0) {
        return '(z)';
      }

      const negativeZero: Complex = [-zero[0], -zero[1]];
      const formatted = formatComplexCoefficient(negativeZero);

      if (formatted === '0.00') {
        return '(z)';
      }

      return `(z+${formatted})`;
    });

    return factors.join('');
  }

  get degree(): number {
    return this.zeroes.length;
  }
}
