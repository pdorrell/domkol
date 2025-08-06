import { makeAutoObservable } from 'mobx';
import { Complex, complex } from '@/utils/complex';

export class DomainCircle {
  center: Complex; // Center position of the circle in complex coordinates
  radiusInUnits: number; // Radius of the circle in complex plane units
  
  constructor(center: Complex = complex(0, 0), radiusInUnits: number = 1) {
    this.center = [...center];
    this.radiusInUnits = radiusInUnits;
    makeAutoObservable(this);
  }

  setCenter(newCenter: Complex): void {
    this.center = [...newCenter];
  }

  setRadius(newRadius: number): void {
    if (newRadius > 0) {
      this.radiusInUnits = newRadius;
    }
  }

  // Get a point on the circle at angle theta (in radians)
  getPointOnCircle(theta: number): Complex {
    const x = this.center[0] + this.radiusInUnits * Math.cos(theta);
    const y = this.center[1] + this.radiusInUnits * Math.sin(theta);
    return [x, y];
  }

  // Check if a point is close to the circle (for selection/interaction)
  distanceFromCircle(point: Complex): number {
    const dx = point[0] - this.center[0];
    const dy = point[1] - this.center[1];
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(distanceFromCenter - this.radiusInUnits);
  }
}