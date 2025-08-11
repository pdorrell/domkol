import { Complex, formatComplexCoefficient } from '@/utils/complex';
import { ComplexFunction } from './ComplexFunction';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { ValueModel } from '@/utils/value-model';
import { makeObservables } from '@/utils/mobx-helpers';

export class PolynomialFunction implements ComplexFunction {
  paramModels: DraggableValueModel[];

  constructor(zeroes: Complex[]) {
    this.paramModels = zeroes.map(zero => new DraggableValueModel(new ValueModel<Complex>([...zero])));

    makeObservables(this, {
      observable: 'paramModels',
      computed: 'zeroes formula degree params',
      action: ''
    });
  }

  get zeroes(): Complex[] {
    return this.paramModels.map(model => model.value);
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
    return this.paramModels.length;
  }

  get params(): Complex[] {
    return this.zeroes;
  }
}
