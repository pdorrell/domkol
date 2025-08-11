import { Complex } from '@/utils/complex';
import { ComplexFunction } from './ComplexFunction';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { makeObservables } from '@/utils/mobx-helpers';

export class ExponentialFunction implements ComplexFunction {
  paramModels: DraggableValueModel[] = [];

  constructor() {
    makeObservables(this, {
      observable: 'paramModels',
      computed: 'formula params'
    });
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
