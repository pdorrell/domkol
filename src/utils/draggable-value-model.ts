import { Complex } from '@/utils/complex';
import { ValueModel } from '@/utils/value-model';
import { DragState } from '@/utils/drag-state';
import { makeObservables } from '@/utils/mobx-helpers';

/**
 * Extends ValueModel<Complex> with drag state management for draggable UI elements
 */
export class DraggableValueModel extends ValueModel<Complex> {
  dragState: DragState;

  constructor(initialValue: Complex) {
    // Pass skipMobx=true to prevent parent from calling makeAutoObservable
    super(initialValue, true);
    this.dragState = new DragState();

    // Use helper for cleaner syntax
    makeObservables(this, {
      observable: 'value dragState',
      action: 'set update startDrag endDrag'
    });
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
   * Overrides parent to integrate with drag state
   */
  update(newValue: Complex, changing: boolean): void {
    this.value = newValue;
    if (!changing && this.dragState.isDragging) {
      this.endDrag();
    }
  }
}
