import { makeAutoObservable } from 'mobx';
import { Complex } from '@/utils/complex';
import { ComplexFunction } from './ComplexFunction';

export class ExponentialFunction implements ComplexFunction {
  constructor() {
    makeAutoObservable(this);
  }

  getFunction() {
    return (z: Complex): Complex => {
      const realFactor = Math.exp(z[0]);
      const cos = Math.cos(z[1]);
      const sin = Math.sin(z[1]);
      return [realFactor * cos, realFactor * sin];
    };
  }

  // Optimized allocation-free implementation
  getWriterFunction() {
    return (x: number, y: number, result: Complex) => {
      const realFactor = Math.exp(x);
      const cos = Math.cos(y);
      const sin = Math.sin(y);
      result[0] = realFactor * cos;
      result[1] = realFactor * sin;
    };
  }

  get formula(): string {
    return 'exp(z)';
  }
}
