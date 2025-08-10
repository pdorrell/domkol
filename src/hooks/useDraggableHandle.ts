import React from 'react';
import { ViewportConfig, pixelToComplex, complexToPixel } from '@/utils/coordinateTransforms';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { Complex } from '@/utils/complex';
import { useDraggable } from './useDraggable';

export interface GetCurrentPointCalculator {
  (
    event: React.MouseEvent | React.TouchEvent,
    handleRect: DOMRect
  ): { x: number; y: number };
}

export interface UseDraggableHandleOptions {
  value: DraggableValueModel;
  viewport: ViewportConfig;
  getCurrentPoint: GetCurrentPointCalculator;
}

export function useDraggableHandle({
  value,
  viewport,
  getCurrentPoint
}: UseDraggableHandleOptions) {
  // Convert complex number to pixel position for display
  const [pixelX, pixelY] = complexToPixel(value.value, viewport);

  const { elementRef, isDragging, handlePointerDown } = useDraggable<Complex>({
    initialValue: value.value,
    onDragStart: (_complexValue) => {
      // Start drag in the DraggableValueModel's drag state
      // The drag offset is calculated by the generic hook, we just need to start the drag
      value.dragState.startDrag(0, 0); // We'll update this properly in the move handler
    },
    onDragMove: (complexValue, changing) => {
      value.update(complexValue, changing);
    },
    onDragEnd: (complexValue) => {
      value.update(complexValue, false);
      value.dragState.endDrag();
    },
    getCurrentPoint: (event, rect, _currentValue) => {
      return getCurrentPoint(event, rect);
    },
    calculateNewPosition: (clientX, clientY, dragOffset, currentValue, elementRef) => {
      const container = elementRef.current?.parentElement;
      if (!container) return currentValue;

      const containerRect = container.getBoundingClientRect();

      // Convert pointer position to container-relative coordinates
      const containerX = clientX - containerRect.left - dragOffset.offsetX;
      const containerY = clientY - containerRect.top - dragOffset.offsetY;

      // Convert to complex number
      return pixelToComplex(containerX, containerY, viewport);
    }
  });

  return {
    handleRef: elementRef as React.RefObject<HTMLDivElement>,
    pixelX,
    pixelY,
    dragState: { isDragging },
    handlePointerDown
  };
}
