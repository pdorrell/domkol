import { makeAutoObservable } from 'mobx';
import { Complex } from '@/utils/complex';
import { ComplexFunction } from './ComplexFunction';

export class ExponentialFunction implements ComplexFunction {
  constructor() {
    makeAutoObservable(this);
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

  get params(): Complex[] {
    return [];
  }
}
