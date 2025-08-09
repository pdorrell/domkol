import { Complex } from '@/utils/complex';

/**
 * Base interface for complex functions that can be visualized
 */
export interface ComplexFunction {
  /**
   * Get a function that writes the result directly into a provided array.
   * This avoids allocating new arrays for each evaluation.
   * @returns A function that takes x, y coordinates and writes f(x+iy) into the result array
   */
  getWriterFunction(): (x: number, y: number, result: Complex) => void;

  /**
   * Get the string representation/formula of this function
   */
  readonly formula: string;

  /**
   * Get the parameters that control this function.
   * For polynomials, this is the list of zeroes.
   * For exponential functions, this is an empty list.
   */
  readonly params: Complex[];
}
