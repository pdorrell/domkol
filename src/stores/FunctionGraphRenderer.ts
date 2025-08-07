import { makeAutoObservable } from 'mobx';
import { Complex, complex, times } from '@/utils/complex';
import { PolynomialFunction } from './PolynomialFunction';
import { DomainCircle } from './DomainCircle';
import { ViewportConfig, getViewportBounds } from '@/utils/coordinateTransforms';

export interface GraphPoint {
  x: number;
  y: number;
  z?: number; // Z-coordinate for 3D visualization
}

export interface FunctionGraphPaths {
  real: string;
  imaginary: string;
  realPath3D: string;
  realPathUnder3D: string;
  realPathShadow: string;
  realPathShadow2: string;
}

export class FunctionGraphRenderer {
  // Visualization settings
  showGraphOnCircle: boolean = true;
  show3DGraph: boolean = true; // Start in 3D mode like original
  scaleF: number = 1.0; // Function scaling factor
  graphRotation: Complex = complex(1, 0); // Rotation applied to function values
  wiggling: boolean = true; // Start with wiggle animation like original
  wiggleAngle: number = 0;
  
  // Graph rotation slider value (0-100, where 50 is default/no rotation)
  graphRotationSliderValue: number = 50;
  
  // Graph scale slider value (0-100, where 50 is default scale of 1.0)
  scaleFSliderValue: number = 50;
  
  // Animation state
  private wiggleAngles: number[] = [];
  private wiggleIndex: number = 0;
  
  // Graph rendering parameters
  private circumferenceIncrementInPixels: number = 2; // Resolution of graph sampling
  
  constructor() {
    makeAutoObservable(this);
    this.initializeWiggleAngles();
  }
  
  setShowGraphOnCircle(show: boolean): void {
    this.showGraphOnCircle = show;
  }
  
  setShow3DGraph(show3D: boolean): void {
    this.show3DGraph = show3D;
  }
  
  setScaleF(scale: number): void {
    this.scaleF = Math.max(0.01, scale);
  }
  
  setGraphRotation(rotation: Complex): void {
    this.graphRotation = [...rotation];
  }
  
  setWiggling(wiggling: boolean): void {
    this.wiggling = wiggling;
  }
  
  setGraphRotationFromSlider(sliderValue: number): void {
    this.graphRotationSliderValue = sliderValue;
    // Convert slider value (0-100) to rotation angle
    const angle = ((sliderValue - 50) / 50) * Math.PI; // -π to π
    this.graphRotation = complex(Math.cos(angle), Math.sin(angle));
  }
  
  setScaleFFromSlider(sliderValue: number): void {
    this.scaleFSliderValue = sliderValue;
    // Convert slider value (0-100) to scale, where 50 = 1.0
    // Using exponential scaling for better range
    this.scaleF = Math.pow(1.05, sliderValue - 50);
  }
  
  private initializeWiggleAngles(): void {
    const maxWiggle = 0.3;
    const numWiggles = 15;
    this.wiggleAngles = [];
    
    for (let i = 0; i < numWiggles; i++) {
      const angleAngle = (Math.PI * 2 * i) / numWiggles;
      this.wiggleAngles[i] = maxWiggle * Math.sin(angleAngle);
    }
  }
  
  wiggleOneStep(): void {
    if (this.wiggling) {
      this.wiggleIndex = (this.wiggleIndex + 1) % this.wiggleAngles.length;
      this.wiggleAngle = this.wiggleAngles[this.wiggleIndex];
    }
  }
  
  // Calculate function values around the domain circle
  functionGraphPointArrays(
    polynomialFunction: PolynomialFunction,
    domainCircle: DomainCircle,
    viewport: ViewportConfig
  ): { real: GraphPoint[]; imaginary: GraphPoint[]; real3D: GraphPoint[] } {
    const pointsReal: GraphPoint[] = [];
    const pointsReal3D: GraphPoint[] = [];
    const pointsImaginary: GraphPoint[] = [];
    
    if (!this.showGraphOnCircle) {
      return { real: pointsReal, imaginary: pointsImaginary, real3D: pointsReal3D };
    }
    
    // Convert circle parameters to pixel coordinates
    const bounds = getViewportBounds(viewport);
    const centerX = (domainCircle.center[0] - bounds.xMin) / (bounds.xMax - bounds.xMin) * viewport.width;
    const centerY = (bounds.yMax - domainCircle.center[1]) / (bounds.yMax - bounds.yMin) * viewport.height;
    const radiusPixels = domainCircle.radiusInUnits * viewport.pixelsPerUnit;
    
    const angleIncrement = this.circumferenceIncrementInPixels / radiusPixels;
    const numSteps = Math.ceil(2 * Math.PI / angleIncrement);
    
    const scaleFPixels = this.scaleF * viewport.pixelsPerUnit;
    
    for (let i = 0; i <= numSteps; i++) {
      const theta = i * angleIncrement;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      // Point on domain circle
      const domainX = domainCircle.center[0] + domainCircle.radiusInUnits * Math.cos(theta);
      const domainY = domainCircle.center[1] + domainCircle.radiusInUnits * Math.sin(theta);
      const domainPoint: Complex = [domainX, domainY];
      
      // Evaluate polynomial function
      let fValue = polynomialFunction.evaluate(domainPoint);
      
      // Apply rotation to function value
      fValue = times(this.graphRotation, fValue);
      
      // Map function values to visual coordinates
      const rReal = radiusPixels + fValue[0] * scaleFPixels;
      const rImaginary = radiusPixels + fValue[1] * scaleFPixels;
      
      const realX = rReal * sinTheta + centerX;
      const realY = rReal * cosTheta + centerY;
      
      const imaginaryX = rImaginary * sinTheta + centerX;
      const imaginaryY = rImaginary * cosTheta + centerY;
      
      // Store points
      pointsReal[i] = { x: realX, y: realY };
      pointsImaginary[i] = { x: imaginaryX, y: imaginaryY };
      
      // For 3D visualization, add wiggle effect and Z coordinate
      const imaginaryZ = fValue[1] * scaleFPixels;
      const real3DX = realX + this.wiggleAngle * imaginaryZ;
      pointsReal3D[i] = { x: real3DX, y: realY, z: imaginaryZ };
    }
    
    return { real: pointsReal, imaginary: pointsImaginary, real3D: pointsReal3D };
  }
  
  // Create SVG path from points (translated from original createPointsPath)
  createPointsPath(points: GraphPoint[]): string {
    if (points.length === 0) {
      return "M0,0";
    }
    
    const pointStrings: string[] = [];
    for (let i = 0; i < points.length; i++) {
      const x = 0.001 * Math.round(points[i].x * 1000);
      const y = 0.001 * Math.round(points[i].y * 1000);
      pointStrings[i] = `${x},${y}`;
    }
    
    if (pointStrings.length > 0) {
      pointStrings[0] = "M" + pointStrings[0];
    }
    if (pointStrings.length > 1) {
      pointStrings[1] = "L" + pointStrings[1];
    }
    
    return pointStrings.join(" ");
  }
  
  // Create 3D paths with over/under segments and shadows (translated from original)
  createOverUnderAndShadowPointPaths(points: GraphPoint[]): {
    overPath: string;
    underPath: string;
    shadowPath: string;
    shadowPath2: string;
  } {
    const overPoints: string[] = [];
    const underPoints: string[] = [];
    const shadowPoints: string[] = [];
    const shadowPoints2: string[] = [];
    
    let currentPath = -1;
    let currentPointNum = -1;
    const dashLength = 10;
    const dashGap = 3;
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const whichPath = (point.z || 0) >= 0 ? 0 : 1; // over = 0, under = 1
      
      // Handle path switching like the old code
      if (whichPath !== currentPath) {
        currentPointNum = 0;
        currentPath = whichPath;
      } else {
        currentPointNum++;
      }
      
      // Calculate dash position like the old code
      const dashPos = i % dashLength;
      if (dashPos === 0) {
        currentPointNum = 0;
      }
      
      const x = 0.001 * Math.round(point.x * 1000);
      const y = 0.001 * Math.round(point.y * 1000);
      
      // Only add points that are in the "dash" part, not the "gap" part
      if (dashPos + dashGap < dashLength) {
        const prefix = currentPointNum === 0 ? "M" : (currentPointNum === 1 ? "L" : "");
        const pointString = prefix + `${x},${y}`;
        
        if (whichPath === 0) {
          overPoints.push(pointString);
        } else {
          underPoints.push(pointString);
        }
      }
      
      // Create shadow points for "over" portions (only when in dash, not gap)
      if (whichPath === 0 && point.z && dashPos + dashGap < dashLength) {
        // First shadow (like old code)
        const shadowOffset = point.z * 3; // Amplify the shadow offset
        const shadowX = x + shadowOffset;
        const shadowY = y + shadowOffset;
        
        const prefix = currentPointNum === 0 ? "M" : (currentPointNum === 1 ? "L" : "");
        const shadowPointString = prefix + `${shadowX},${shadowY}`;
        shadowPoints.push(shadowPointString);
        
        // Second shadow (0.7 * z for x, 0.5 * z for y like old code)
        const shadow2X = x + 0.7 * shadowOffset;
        const shadow2Y = y + 0.5 * shadowOffset;
        const shadow2PointString = prefix + `${shadow2X},${shadow2Y}`;
        shadowPoints2.push(shadow2PointString);
      }
    }
    
    return {
      overPath: overPoints.join(" "),
      underPath: underPoints.join(" "),
      shadowPath: shadowPoints.join(" "),
      shadowPath2: shadowPoints2.join(" ")
    };
  }
  
  // Generate all graph paths for rendering
  generateGraphPaths(
    polynomialFunction: PolynomialFunction,
    domainCircle: DomainCircle,
    viewport: ViewportConfig
  ): FunctionGraphPaths {
    const pointArrays = this.functionGraphPointArrays(polynomialFunction, domainCircle, viewport);
    
    if (this.show3DGraph) {
      const paths3D = this.createOverUnderAndShadowPointPaths(pointArrays.real3D);
      return {
        real: "",
        imaginary: "",
        realPath3D: paths3D.overPath,
        realPathUnder3D: paths3D.underPath,
        realPathShadow: paths3D.shadowPath,
        realPathShadow2: paths3D.shadowPath2
      };
    } else {
      return {
        real: this.createPointsPath(pointArrays.real),
        imaginary: this.createPointsPath(pointArrays.imaginary),
        realPath3D: "",
        realPathUnder3D: "",
        realPathShadow: "",
        realPathShadow2: ""
      };
    }
  }
}