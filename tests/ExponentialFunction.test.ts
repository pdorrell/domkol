import { ExponentialFunction } from '@/stores/ExponentialFunction';
import { Complex } from '@/utils/complex';

describe('ExponentialFunction', () => {
  describe('formula', () => {
    it('should return exp(z)', () => {
      const exp = new ExponentialFunction();
      expect(exp.formula).toBe('exp(z)');
    });
  });

  describe('getFunction', () => {
    it('should evaluate exp(0) = 1', () => {
      const exp = new ExponentialFunction();
      const f = exp.getFunction();

      const result = f([0, 0]);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should evaluate exp(1) = e', () => {
      const exp = new ExponentialFunction();
      const f = exp.getFunction();

      const result = f([1, 0]);
      expect(result[0]).toBeCloseTo(Math.E);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should evaluate exp(i*pi) = -1', () => {
      const exp = new ExponentialFunction();
      const f = exp.getFunction();

      const result = f([0, Math.PI]);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should evaluate exp(i*pi/2) = i', () => {
      const exp = new ExponentialFunction();
      const f = exp.getFunction();

      const result = f([0, Math.PI / 2]);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
    });

    it('should evaluate exp(1 + i*pi/2) = e*i', () => {
      const exp = new ExponentialFunction();
      const f = exp.getFunction();

      const result = f([1, Math.PI / 2]);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(Math.E);
    });
  });

  describe('getWriterFunction', () => {
    it('should write exp(0) = 1', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [0, 0];

      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write exp(1) = e', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [0, 0];

      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(Math.E);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write exp(i*pi) = -1', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [0, 0];

      writer(0, Math.PI, result);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should write exp(i*pi/2) = i', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [0, 0];

      writer(0, Math.PI / 2, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
    });

    it('should write exp(1 + i*pi/2) = e*i', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [0, 0];

      writer(1, Math.PI / 2, result);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(Math.E);
    });

    it('should reuse the same result array', () => {
      const exp = new ExponentialFunction();
      const writer = exp.getWriterFunction();
      const result: Complex = [999, 999]; // Start with arbitrary values

      writer(0, 0, result);
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);

      // Same array should be reused
      writer(1, 0, result);
      expect(result[0]).toBeCloseTo(Math.E);
      expect(result[1]).toBeCloseTo(0);
    });
  });
});
