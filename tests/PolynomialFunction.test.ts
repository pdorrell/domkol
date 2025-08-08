import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { Complex } from '@/utils/complex';

describe('PolynomialFunction', () => {
  describe('formula', () => {
    it('should format empty polynomial as "1"', () => {
      const poly = new PolynomialFunction([]);
      expect(poly.formula).toBe('1');
    });

    it('should format single zero root as "(z)"', () => {
      const roots: Complex[] = [[0, 0]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z)');
    });

    it('should format real root with correct coefficient', () => {
      const roots: Complex[] = [[2, 0]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z+-2.00)');
    });

    it('should format complex root with correct coefficient', () => {
      const roots: Complex[] = [[1, -1]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z+-1.00+1.00i)');
    });

    it('should format example case: roots 0, -4-i, 2i', () => {
      const roots: Complex[] = [[0, 0], [-4, -1], [0, 2]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z)(z+4.00+1.00i)(z+0.00-2.00i)');
    });

    it('should format multiple roots correctly', () => {
      const roots: Complex[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z+-1.00)(z+1.00)(z+0.00-1.00i)(z+0.00+1.00i)');
    });

    it('should handle purely imaginary roots', () => {
      const roots: Complex[] = [[0, 3]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z+0.00-3.00i)');
    });

    it('should handle negative real roots', () => {
      const roots: Complex[] = [[-5, 0]];
      const poly = new PolynomialFunction(roots);
      expect(poly.formula).toBe('(z+5.00)');
    });
  });


  describe('getWriterFunction', () => {
    it('should write simple real polynomial result correctly', () => {
      const roots: Complex[] = [[1, 0], [-1, 0]]; // (z-1)(z+1) = z^2 - 1
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 0: should give -1
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);

      // At z = 2: should give 3
      writer(2, 0, result);
      expect(result[0]).toBeCloseTo(3);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write complex roots result correctly', () => {
      // (z - i)(z + i) = z^2 + 1
      const roots: Complex[] = [[0, 1], [0, -1]];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 0: should give 1
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);

      // At z = i: should give 0
      writer(0, 1, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);

      // At z = 2i: (2i - i)(2i + i) = i * 3i = -3
      writer(0, 2, result);
      expect(result[0]).toBeCloseTo(-3);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write quintic polynomial result with complex zeroes', () => {
      // Five zeroes as in the quintic example
      const roots: Complex[] = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [-0.05, -0.17]
      ];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At the fifth zero, should be 0
      writer(-0.05, -0.17, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);

      // At z = 1: z^4 * (z - (-0.05 - 0.17i)) = 1 * (1.05 + 0.17i)
      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(1.05);
      expect(result[1]).toBeCloseTo(0.17);
    });

    it('should handle empty polynomial (constant 1)', () => {
      const poly = new PolynomialFunction([]);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // Should always write 1
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);

      writer(123, 456, result);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write cubic with mixed real and complex roots', () => {
      // (z - 1)(z - (1+i))(z - (1-i))
      const roots: Complex[] = [[1, 0], [1, 1], [1, -1]];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 1: should be 0
      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);

      // At z = 1+i: should be 0
      writer(1, 1, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);

      // At z = 0: (-1) * (-1-i) * (-1+i) = -1 * (1 - i^2) = -1 * 2 = -2
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(-2);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should handle high-degree polynomial efficiently', () => {
      // Create a degree-10 polynomial
      const roots: Complex[] = [];
      for (let i = 0; i < 10; i++) {
        roots.push([Math.cos(2 * Math.PI * i / 10), Math.sin(2 * Math.PI * i / 10)]);
      }
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 0: product of all roots (10th roots of unity)
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);

      // At z = 1: should be 0 (since 1 is one of the roots)
      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should handle repeated complex roots', () => {
      // (z - (1+i))^3
      const roots: Complex[] = [[1, 1], [1, 1], [1, 1]];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 1+i: should be 0
      writer(1, 1, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);

      // At z = 0: (-(1+i))^3 = 2 - 2i
      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(2);
      expect(result[1]).toBeCloseTo(-2);
    });

    it('should preserve precision for small perturbations', () => {
      const roots: Complex[] = [[1, 0], [1.0001, 0]];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [0, 0];

      // At z = 1: should be very close to 0 but not exactly 0
      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(-0.0001);
      expect(result[1]).toBeCloseTo(0);

      // At z = 1.0001: should be very close to 0
      writer(1.0001, 0, result);
      expect(result[0]).toBeCloseTo(0.0001);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should reuse the same result array', () => {
      const roots: Complex[] = [[1, 0], [-1, 0]];
      const poly = new PolynomialFunction(roots);
      const writer = poly.getWriterFunction();
      const result: Complex = [999, 999]; // Start with arbitrary values

      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);

      // Same array should be reused
      writer(2, 0, result);
      expect(result[0]).toBeCloseTo(3);
      expect(result[1]).toBeCloseTo(0);
    });
  });
});
