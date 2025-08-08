import React, { useCallback, useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Complex, formatComplex } from '@/utils/complex';
import { ViewportConfig, pixelToComplex, complexToPixel } from '@/utils/coordinateTransforms';
import './ComplexNumberHandle.css';

interface ComplexNumberHandleProps {
  index: number;
  value: Complex;
  viewport: ViewportConfig;
  onChange: (index: number, newValue: Complex, changing: boolean) => void;
}

const ComplexNumberHandle: React.FC<ComplexNumberHandleProps> = observer(({
  index,
  value,
  viewport,
  onChange
}) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);

  // Convert complex number to pixel position for display
  const [pixelX, pixelY] = complexToPixel(value, viewport);

  // Handle pointer down to start dragging (mouse or touch)
  const handlePointerDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    // Calculate offset from pointer position to the point circle position
    // The point circle is at left: -4px, top: 21px relative to the container
    const rect = handleRef.current?.getBoundingClientRect();
    if (rect) {
      const pointCircleX = rect.left - 4 + 2; // -4px offset + 2px radius to get center
      const pointCircleY = rect.top + 21 + 2; // 21px offset + 2px radius to get center
      const offsetX = clientX - pointCircleX;
      const offsetY = clientY - pointCircleY;
      setDragOffset([offsetX, offsetY]);
    }
  }, []);

  // Handle pointer move during drag (mouse or touch)
  const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    event.preventDefault(); // Prevent scrolling

    const container = handleRef.current?.parentElement;
    if (!container) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const containerRect = container.getBoundingClientRect();

    // Convert pointer position to container-relative coordinates
    const containerX = clientX - containerRect.left - dragOffset[0];
    const containerY = clientY - containerRect.top - dragOffset[1];

    // Convert to complex number
    const newValue = pixelToComplex(containerX, containerY, viewport);

    // Call onChange with changing=true
    onChange(index, newValue, true);
  }, [isDragging, dragOffset, viewport, index, onChange]);

  // Handle pointer up to end dragging (mouse or touch)
  const handlePointerUp = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const container = handleRef.current?.parentElement;
    if (!container) return;

    const clientX = 'touches' in event && event.changedTouches.length > 0
      ? event.changedTouches[0].clientX
      : 'clientX' in event ? event.clientX : 0;
    const clientY = 'touches' in event && event.changedTouches.length > 0
      ? event.changedTouches[0].clientY
      : 'clientY' in event ? event.clientY : 0;

    const containerRect = container.getBoundingClientRect();

    // Convert final pointer position to container-relative coordinates
    const containerX = clientX - containerRect.left - dragOffset[0];
    const containerY = clientY - containerRect.top - dragOffset[1];

    // Convert to complex number
    const newValue = pixelToComplex(containerX, containerY, viewport);

    // Call onChange with changing=false to indicate drag is complete
    onChange(index, newValue, false);
    setIsDragging(false);
  }, [isDragging, dragOffset, viewport, index, onChange]);

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

  // Format the complex number for display
  const formattedValue = formatComplex(value, 2);

  return (
    <div
      ref={handleRef}
      className="number-handle"
      style={{
        position: 'absolute',
        left: pixelX + 2,
        top: pixelY - 23,
        cursor: 'move',
        zIndex: 1000
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div className="number-text">
        {formattedValue}
      </div>
      <div className="point-circle" />
    </div>
  );
});

export default ComplexNumberHandle;
