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

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);

    // Calculate offset from mouse position to the point circle position
    // The point circle is at left: -4px, top: 21px relative to the container
    const rect = handleRef.current?.getBoundingClientRect();
    if (rect) {
      const pointCircleX = rect.left - 4 + 2; // -4px offset + 2px radius to get center
      const pointCircleY = rect.top + 21 + 2; // 21px offset + 2px radius to get center
      const offsetX = event.clientX - pointCircleX;
      const offsetY = event.clientY - pointCircleY;
      setDragOffset([offsetX, offsetY]);
    }
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;

    const container = handleRef.current?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Convert mouse position to container-relative coordinates
    const containerX = event.clientX - containerRect.left - dragOffset[0];
    const containerY = event.clientY - containerRect.top - dragOffset[1];

    // Convert to complex number
    const newValue = pixelToComplex(containerX, containerY, viewport);

    // Call onChange with changing=true
    onChange(index, newValue, true);
  }, [isDragging, dragOffset, viewport, index, onChange]);

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isDragging) return;

    const container = handleRef.current?.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Convert final mouse position to container-relative coordinates
    const containerX = event.clientX - containerRect.left - dragOffset[0];
    const containerY = event.clientY - containerRect.top - dragOffset[1];

    // Convert to complex number
    const newValue = pixelToComplex(containerX, containerY, viewport);

    // Call onChange with changing=false to indicate drag is complete
    onChange(index, newValue, false);
    setIsDragging(false);
  }, [isDragging, dragOffset, viewport, index, onChange]);

  // Set up global mouse event listeners during drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
      onMouseDown={handleMouseDown}
    >
      <div className="number-text">
        {formattedValue}
      </div>
      <div className="point-circle" />
    </div>
  );
});

export default ComplexNumberHandle;
