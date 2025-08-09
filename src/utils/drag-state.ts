import { makeAutoObservable } from 'mobx';

/**
 * Manages drag state for draggable UI elements
 */
export class DragState {
  isDragging: boolean = false;
  dragOffset: [number, number] = [0, 0];

  constructor() {
    makeAutoObservable(this);
  }

  startDrag(offsetX: number, offsetY: number): void {
    this.isDragging = true;
    this.dragOffset = [offsetX, offsetY];
  }

  endDrag(): void {
    this.isDragging = false;
    this.dragOffset = [0, 0];
  }

  updateOffset(offsetX: number, offsetY: number): void {
    this.dragOffset = [offsetX, offsetY];
  }
}
