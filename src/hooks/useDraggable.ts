import React, { useCallback, useRef, useEffect, useState } from 'react';

export interface GetCurrentPointCalculator<T> {
  (
    event: React.MouseEvent | React.TouchEvent,
    elementRect: DOMRect,
    currentValue: T
  ): { x: number; y: number };
}

export interface DragPositionCalculator<T> {
  (
    clientX: number,
    clientY: number,
    dragOffset: { offsetX: number; offsetY: number },
    currentValue: T,
    elementRef: React.RefObject<HTMLElement>
  ): T;
}

export interface UseDraggableOptions<T> {
  initialValue: T;
  onDragStart?: (value: T) => void;
  onDragMove?: (value: T, isDragging: boolean) => void;
  onDragEnd: (value: T) => void;
  getCurrentPoint: GetCurrentPointCalculator<T>;
  calculateNewPosition: DragPositionCalculator<T>;
  shouldStartDrag?: (event: React.MouseEvent | React.TouchEvent) => boolean;
}

export function useDraggable<T>({
  initialValue,
  onDragStart,
  onDragMove,
  onDragEnd,
  getCurrentPoint,
  calculateNewPosition,
  shouldStartDrag = () => true
}: UseDraggableOptions<T>) {
  const elementRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ offsetX: 0, offsetY: 0 });
  const [currentValue, setCurrentValue] = useState<T>(initialValue);

  // Update current value when initialValue changes
  useEffect(() => {
    if (!isDragging) {
      setCurrentValue(initialValue);
    }
  }, [initialValue, isDragging]);

  // Handle pointer down to start dragging (mouse or touch)
  const handlePointerDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!shouldStartDrag(event)) {
      return;
    }

    event.preventDefault();

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      // Extract client position from event
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Get the current point to calculate offset from
      const currentPoint = getCurrentPoint(event, rect, currentValue);

      // Calculate drag offset
      const offsetX = clientX - currentPoint.x;
      const offsetY = clientY - currentPoint.y;

      setDragOffset({ offsetX, offsetY });
      setIsDragging(true);
      onDragStart?.(currentValue);
    }
  }, [currentValue, getCurrentPoint, shouldStartDrag, onDragStart]);

  // Handle pointer move during drag (mouse or touch)
  const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    event.preventDefault(); // Prevent scrolling

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const newValue = calculateNewPosition(clientX, clientY, dragOffset, currentValue, elementRef);
    setCurrentValue(newValue);
    onDragMove?.(newValue, true);
  }, [isDragging, dragOffset, currentValue, calculateNewPosition, onDragMove]);

  // Handle pointer up to end dragging (mouse or touch)
  const handlePointerUp = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in event && event.changedTouches.length > 0
      ? event.changedTouches[0].clientX
      : 'clientX' in event ? event.clientX : 0;
    const clientY = 'touches' in event && event.changedTouches.length > 0
      ? event.changedTouches[0].clientY
      : 'clientY' in event ? event.clientY : 0;

    const finalValue = calculateNewPosition(clientX, clientY, dragOffset, currentValue, elementRef);
    setCurrentValue(finalValue);
    setIsDragging(false);
    onDragEnd(finalValue);
  }, [isDragging, dragOffset, currentValue, calculateNewPosition, onDragEnd]);

  // Set up global pointer event listeners during drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);

      return () => {
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseup', handlePointerUp);
        document.removeEventListener('touchmove', handlePointerMove);
        document.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return {
    elementRef,
    isDragging,
    currentValue,
    handlePointerDown
  };
}
