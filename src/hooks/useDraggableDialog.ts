import React, { useState } from 'react';
import { useDraggable } from './useDraggable';

export interface UseDraggableDialogOptions {
  initialPosition?: { x: number; y: number };
  shouldStartDrag?: (event: React.MouseEvent | React.TouchEvent) => boolean;
}

export function useDraggableDialog({
  initialPosition = { x: 0, y: 0 },
  shouldStartDrag
}: UseDraggableDialogOptions = {}) {
  const [position, setPosition] = useState(initialPosition);

  const { elementRef, currentValue, handlePointerDown } = useDraggable<{x: number, y: number}>({
    initialValue: position,
    shouldStartDrag,
    onDragEnd: (finalPosition) => {
      // Update the position state so it doesn't jump back
      setPosition(finalPosition);
    },
    getCurrentPoint: (_event, _rect, currentPosition) => {
      // For dialogs, the current point is simply the current position
      return currentPosition;
    },
    calculateNewPosition: (clientX, clientY, dragOffset) => {
      return {
        x: clientX - dragOffset.offsetX,
        y: clientY - dragOffset.offsetY
      };
    }
  });

  return {
    dialogRef: elementRef,
    position: currentValue,
    handlePointerDown,
    setPosition
  };
}
