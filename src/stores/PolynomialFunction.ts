import { makeAutoObservable } from 'mobx';
import { Complex, complex, subtract, multiply, formatComplexCoefficient } from '@/utils/complex';

export class PolynomialFunction {
  zeroes: Complex[];

  constructor(zeroes: Complex[]) {
    this.zeroes = [...zeroes];
    makeAutoObservable(this);
  }

  updateZero(index: number, newValue: Complex, changing?: boolean): void {
    if (index >= 0 && index < this.zeroes.length) {
      // Always update the zero position immediately - the domain coloring canvas
      // will decide whether to repaint based on its own repaintContinuously setting
      this.zeroes[index] = newValue;
    }
  }

  evaluate(z: Complex): Complex {
    let result: Complex = complex(1, 0);
    
    for (const zero of this.zeroes) {
      const factor = subtract(z, zero);
      result = multiply(result, factor);
    }
    
    return result;
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