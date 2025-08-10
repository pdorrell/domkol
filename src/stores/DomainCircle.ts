import { Complex, complex } from '@/utils/complex';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { ValueModel } from '@/utils/value-model';
import { CentreAndRadiusHandleValueModel } from '@/utils/centre-and-radius-handle-value-model';
import { makeObservables } from '@/utils/mobx-helpers';

export class DomainCircle {
  centerModel: DraggableValueModel;
  radiusHandleModel: DraggableValueModel;

  constructor(center: Complex = complex(0, 0), radiusInUnits: number = 1) {
    // Create underlying value models
    const centerValueModel = new ValueModel<Complex>([...center]);
    const radiusHandleValueModel = new ValueModel<Complex>([center[0] + radiusInUnits, center[1]]);

    // Create a special model that couples center and radius handle movement
    const centreAndRadiusModel = new CentreAndRadiusHandleValueModel(centerValueModel, radiusHandleValueModel);

    // Wrap with draggable behavior
    this.centerModel = new DraggableValueModel(centreAndRadiusModel);
    this.radiusHandleModel = new DraggableValueModel(radiusHandleValueModel);

    makeObservables(this, {
      observable: 'centerModel radiusHandleModel',
      computed: 'center radiusInUnits',
      action: 'setCenter setRadius'
    });
  }

  get center(): Complex {
    return this.centerModel.value;
  }

  get radiusInUnits(): number {
    const dx = this.radiusHandleModel.value[0] - this.centerModel.value[0];
    const dy = this.radiusHandleModel.value[1] - this.centerModel.value[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  setCenter(newCenter: Complex): void {
    this.centerModel.set([...newCenter]);
  }

  setRadius(newRadius: number): void {
    if (newRadius > 0) {
      // Update radius handle position to maintain the new radius
      const currentCenter = this.centerModel.value;
      this.radiusHandleModel.set([currentCenter[0] + newRadius, currentCenter[1]]);
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
