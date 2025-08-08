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

  // Create a closure function like the old code for maximum performance
  getFunction() {
    // Deep copy to plain JavaScript arrays to avoid MobX observable overhead
    const plainZeroes = this.zeroes.map(zero => [zero[0], zero[1]]);
    return (z: Complex): Complex => {
      const result: Complex = [1, 0];
      for (let i = 0; i < plainZeroes.length; i++) {
        const zero = plainZeroes[i];
        // Inline complex arithmetic for performance
        const factorReal = z[0] - zero[0];
        const factorImag = z[1] - zero[1];
        const newReal = result[0] * factorReal - result[1] * factorImag;
        const newImag = result[0] * factorImag + result[1] * factorReal;
        result[0] = newReal;
        result[1] = newImag;
      }
      return result;
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
