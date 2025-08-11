import { Complex, complex } from '@/utils/complex';
import { PixelDimensions } from '@/types/dimensions';

export type FunctionType = 'cubic' | 'quintic' | 'identity' | 'exponential';

export interface DomainPageConfig {
  name: string;
  functionType: FunctionType;
  pixelsPerUnit: number;
  originPixelLocation: [number, number];
  pixelsDimension: [number, number];
  initialCircleRadius: number; // in units, not pixels
  initialZeroes: Complex[];
  instructions: string;
}

export class DomainPageModel {
  name: string;
  functionType: FunctionType;
  pixelsPerUnit: number;
  originPixelLocation: [number, number];
  pixelsDimension: [number, number];
  initialCircleRadius: number;
  initialZeroes: Complex[];
  instructions: string;

  constructor(config: DomainPageConfig) {
    this.name = config.name;
    this.functionType = config.functionType;
    this.pixelsPerUnit = config.pixelsPerUnit;
    this.originPixelLocation = config.originPixelLocation;
    this.pixelsDimension = config.pixelsDimension;
    this.initialCircleRadius = config.initialCircleRadius;
    this.initialZeroes = config.initialZeroes || [];
    this.instructions = config.instructions;
  }

  get canvasWidth(): number {
    return this.pixelsDimension[0];
  }

  get canvasHeight(): number {
    return this.pixelsDimension[1];
  }

  get canvasDimensions(): PixelDimensions {
    return {
      width: this.pixelsDimension[0],
      height: this.pixelsDimension[1]
    };
  }
}

// Define the four page models based on the original domkol configurations
export const pageModels: DomainPageModel[] = [
  new DomainPageModel({
    name: 'Cubic Polynomial',
    functionType: 'cubic',
    pixelsPerUnit: 240,
    originPixelLocation: [280, 280],
    pixelsDimension: [560, 560],
    initialCircleRadius: 150 / 240, // Convert pixels to units (0.625)
    initialZeroes: [complex(0, 0), complex(0, 0), complex(0, 0)],
    instructions: 'Drag the blue numbers to change the zeroes of the cubic polynomial (initially they are all located on the origin).'
  }),

  new DomainPageModel({
    name: 'Quintic Polynomial',
    functionType: 'quintic',
    pixelsPerUnit: 300,
    originPixelLocation: [350, 350],
    pixelsDimension: [700, 700],
    initialCircleRadius: 250 / 300, // Convert pixels to units (0.833...)
    initialZeroes: [complex(0, 0), complex(0, 0), complex(0, 0), complex(0, 0), complex(0, 0)],
    instructions: 'Drag the blue numbers to change the zeroes of the quintic polynomial (initially they are all located on the origin).'
  }),

  new DomainPageModel({
    name: 'Identity Function',
    functionType: 'identity',
    pixelsPerUnit: 200,
    originPixelLocation: [310, 350],
    pixelsDimension: [700, 700],
    initialCircleRadius: 200 / 200, // Convert pixels to units (1.0)
    initialZeroes: [complex(0, 0)],
    instructions: 'Drag the blue number to change the zero of the linear polynomial (initially located on the origin).'
  }),

  new DomainPageModel({
    name: 'Exponential',
    functionType: 'exponential',
    pixelsPerUnit: 80,
    originPixelLocation: [250, 350],
    pixelsDimension: [800, 800],
    initialCircleRadius: 150 / 80, // Convert pixels to units (1.875)
    initialZeroes: [], // Exponential has no zeroes
    instructions: 'The exponential function has no zeroes to control.'
  })
];

export function getPageModelByType(type: FunctionType): DomainPageModel | undefined {
  return pageModels.find(model => model.functionType === type);
}
