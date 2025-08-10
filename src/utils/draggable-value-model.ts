import { Complex } from '@/utils/complex';
import { ValueModelInterface } from '@/utils/value-model';
import { DragState } from '@/utils/drag-state';
import { makeObservables } from '@/utils/mobx-helpers';

/**
 * Wraps a ValueModelInterface<Complex> with drag state management for draggable UI elements
 */
export class DraggableValueModel implements ValueModelInterface<Complex> {
  private valueModel: ValueModelInterface<Complex>;
  dragState: DragState;

  constructor(valueModel: ValueModelInterface<Complex>) {
    this.valueModel = valueModel;
    this.dragState = new DragState();

    // Make only the drag-specific attributes observable
    makeObservables(this, {
      observable: 'dragState',
      action: 'startDrag endDrag'
    });
  }

  // Delegate value operations to wrapped model
  get value(): Complex {
    return this.valueModel.value;
  }

  set(newValue: Complex): void {
    this.valueModel.set(newValue);
  }

  /**
   * Start dragging with the given offset
   */
  startDrag(offsetX: number, offsetY: number): void {
    this.dragState.startDrag(offsetX, offsetY);
  }

  /**
   * End the current drag operation
   */
  endDrag(): void {
    this.dragState.endDrag();
  }

  /**
   * Update value with changing state (for drag handles)
   */
  update(newValue: Complex, changing: boolean): void {
    // Use update if available, otherwise fallback to set
    if ('update' in this.valueModel && typeof this.valueModel.update === 'function') {
      this.valueModel.update(newValue, changing);
    } else {
      this.valueModel.set(newValue);
    }

    if (!changing && this.dragState.isDragging) {
      this.endDrag();
    }
  }
}
