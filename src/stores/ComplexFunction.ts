import { Complex } from '@/utils/complex';

/**
 * Base interface for complex functions that can be visualized
 */
export interface ComplexFunction {
  /**
   * Evaluate the function at a given complex number
   */
  evaluate(z: Complex): Complex;

  /**
   * Get the string representation/formula of this function
   */
  readonly formula: string;
}
