import { makeAutoObservable } from 'mobx';
import { Complex } from '@/utils/complex';
import { ComplexFunction, defaultGetWriterFunction } from './ComplexFunction';

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

  // Use default implementation for now
  getWriterFunction() {
    return defaultGetWriterFunction(this);
  }

  get formula(): string {
    return 'exp(z)';
  }
}
