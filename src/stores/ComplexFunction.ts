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
   * Get a function that writes the result directly into a provided array.
   * This avoids allocating new arrays for each evaluation.
   * @returns A function that takes x, y coordinates and writes f(x+iy) into the result array
   */
  getWriterFunction?(): (x: number, y: number, result: Complex) => void;

  /**
   * Get the string representation/formula of this function
   */
  readonly formula: string;
}

/**
 * Default implementation of getWriterFunction using getFunction
 */
export function defaultGetWriterFunction(complexFunction: ComplexFunction): (x: number, y: number, result: Complex) => void {
  const f = complexFunction.getFunction();
  return (x: number, y: number, result: Complex) => {
    const z: Complex = [x, y];
    const fResult = f(z);
    result[0] = fResult[0];
    result[1] = fResult[1];
  };
}
