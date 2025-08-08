import { Complex } from '@/utils/complex';

/**
 * Base interface for complex functions that can be visualized
 */
export interface ComplexFunction {
  /**
   * Get a function that evaluates this complex function.
   * Returns a closure for efficient evaluation in loops.
   */
  getFunction(): (z: Complex) => Complex;

  /**
   * Get the string representation/formula of this function
   */
  readonly formula: string;
}
