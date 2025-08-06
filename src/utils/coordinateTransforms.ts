import { Complex } from './complex';

export interface ViewportConfig {
  // Pixel dimensions of the complex plane viewport
  width: number;
  height: number;
  
  // Complex plane bounds (center and scale)
  originPixelLocation: [number, number]; // [x, y] pixel location of complex origin (0,0)
  pixelsPerUnit: number; // pixels per unit in complex plane
}

/**
 * Convert pixel position to complex number
 */
export function pixelToComplex(
  pixelX: number, 
  pixelY: number, 
  config: ViewportConfig
): Complex {
  const [originX, originY] = config.originPixelLocation;
  const real = (pixelX - originX) / config.pixelsPerUnit;
  const imag = (originY - pixelY) / config.pixelsPerUnit; // Y axis flipped
  return [real, imag];
}

/**
 * Convert complex number to pixel position
 */
export function complexToPixel(
  complex: Complex,
  config: ViewportConfig
): [number, number] {
  const [originX, originY] = config.originPixelLocation;
  const pixelX = originX + (complex[0] * config.pixelsPerUnit);
  const pixelY = originY - (complex[1] * config.pixelsPerUnit); // Y axis flipped
  return [pixelX, pixelY];
}

/**
 * Calculate the complex plane bounds for a given viewport
 */
export function getViewportBounds(config: ViewportConfig): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
} {
  const [originX, originY] = config.originPixelLocation;
  const xMin = -originX / config.pixelsPerUnit;
  const xMax = (config.width - originX) / config.pixelsPerUnit;
  const yMin = (originY - config.height) / config.pixelsPerUnit;
  const yMax = originY / config.pixelsPerUnit;
  
  return { xMin, xMax, yMin, yMax };
}

/**
 * Create default viewport configuration matching original domkol
 * Original had domain range from -1.16 to 1.16 (total span of 2.32 units)
 */
export function createDefaultViewport(width: number, height: number): ViewportConfig {
  const domainSpan = 2.32; // Total span from -1.16 to 1.16
  const pixelsPerUnit = Math.min(width, height) / domainSpan;
  
  return {
    width,
    height,
    originPixelLocation: [width / 2, height / 2], // Center of viewport
    pixelsPerUnit // Scale to show -1.16 to 1.16 range
  };
}