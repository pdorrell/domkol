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

  describe('evaluate', () => {
    it('should evaluate polynomial correctly', () => {
      const roots: Complex[] = [[1, 0], [-1, 0]]; // (z-1)(z+1) = z^2 - 1
      const poly = new PolynomialFunction(roots);
      
      // At z = 0: should give -1
      const result = poly.evaluate([0, 0]);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);
      
      // At z = 2: should give 3
      const result2 = poly.evaluate([2, 0]);
      expect(result2[0]).toBeCloseTo(3);
      expect(result2[1]).toBeCloseTo(0);
    });
  });
});