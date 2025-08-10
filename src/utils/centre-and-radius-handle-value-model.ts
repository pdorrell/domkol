import { Complex } from '@/utils/complex';
import { ValueModelInterface } from '@/utils/value-model';

/**
 * A special ValueModel that when its center position is updated,
 * also moves the radius handle by the same offset to maintain their relative positions.
 * This allows dragging the center handle to move both center and radius handle together.
 */
export class CentreAndRadiusHandleValueModel implements ValueModelInterface<Complex> {
  private centerModel: ValueModelInterface<Complex>;
  private radiusModel: ValueModelInterface<Complex>;

  constructor(centerModel: ValueModelInterface<Complex>, radiusModel: ValueModelInterface<Complex>) {
    this.centerModel = centerModel;
    this.radiusModel = radiusModel;
  }

  get value(): Complex {
    return this.centerModel.value;
  }

  set(newCenterValue: Complex): void {
    // Calculate the offset from the current center to the new center
    const currentCenter = this.centerModel.value;
    const offset: Complex = [
      newCenterValue[0] - currentCenter[0],
      newCenterValue[1] - currentCenter[1]
    ];

    // Move both center and radius handle by the same offset
    this.centerModel.set(newCenterValue);

    const currentRadiusPosition = this.radiusModel.value;
    const newRadiusPosition: Complex = [
      currentRadiusPosition[0] + offset[0],
      currentRadiusPosition[1] + offset[1]
    ];
    this.radiusModel.set(newRadiusPosition);
  }

  /**
   * Update method that also maintains the offset relationship
   */
  update(newCenterValue: Complex, changing: boolean): void {
    // Calculate the offset from the current center to the new center
    const currentCenter = this.centerModel.value;
    const offset: Complex = [
      newCenterValue[0] - currentCenter[0],
      newCenterValue[1] - currentCenter[1]
    ];

    // Update both center and radius handle
    if ('update' in this.centerModel && typeof this.centerModel.update === 'function') {
      this.centerModel.update(newCenterValue, changing);
    } else {
      this.centerModel.set(newCenterValue);
    }

    const currentRadiusPosition = this.radiusModel.value;
    const newRadiusPosition: Complex = [
      currentRadiusPosition[0] + offset[0],
      currentRadiusPosition[1] + offset[1]
    ];

    if ('update' in this.radiusModel && typeof this.radiusModel.update === 'function') {
      this.radiusModel.update(newRadiusPosition, changing);
    } else {
      this.radiusModel.set(newRadiusPosition);
    }
  }
}
