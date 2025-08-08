import { makeAutoObservable } from 'mobx';
import { Complex } from '@/utils/complex';

export class ExponentialFunction {
  constructor() {
    makeAutoObservable(this);
  }

  evaluate(z: Complex): Complex {
    const realFactor = Math.exp(z[0]);
    const cos = Math.cos(z[1]);
    const sin = Math.sin(z[1]);
    return [realFactor * cos, realFactor * sin];
  }

  get formula(): string {
    return 'exp(z)';
  }
}
