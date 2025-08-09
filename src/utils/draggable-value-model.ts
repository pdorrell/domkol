import { makeObservable, observable } from 'mobx';
import { Complex } from '@/utils/complex';
import { ValueModel } from '@/utils/value-model';
import { DragState } from '@/utils/drag-state';

/**
 * Extends ValueModel<Complex> with drag state management for draggable UI elements
 */
export class DraggableValueModel extends ValueModel<Complex> {
  dragState: DragState;

  constructor(initialValue: Complex) {
    super(initialValue);
    this.dragState = new DragState();
    
    // Use makeObservable for subclasses instead of makeAutoObservable
    makeObservable(this, {
      dragState: observable
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
