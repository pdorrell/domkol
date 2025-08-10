import React from 'react';
import { observer } from 'mobx-react-lite';
import { formatComplex } from '@/utils/complex';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { useDraggableHandle } from '@/hooks/useDraggableHandle';
import './ComplexNumberHandle.scss';

interface ComplexNumberHandleProps {
  value: DraggableValueModel;
  viewport: ViewportConfig;
}

const ComplexNumberHandle: React.FC<ComplexNumberHandleProps> = observer(({
  value,
  viewport
}) => {
  const { handleRef, pixelX, pixelY, handlePointerDown } = useDraggableHandle({
    value,
    viewport,
    calculateDragOffset: (event, rect) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Calculate offset from pointer position to the point circle position
      // The point circle is at left: -4px, top: 21px relative to the container
      const pointCircleX = rect.left - 4 + 2; // -4px offset + 2px radius to get center
      const pointCircleY = rect.top + 21 + 2; // 21px offset + 2px radius to get center
      const offsetX = clientX - pointCircleX;
      const offsetY = clientY - pointCircleY;
      return { offsetX, offsetY };
    }
  });

  // Format the complex number for display
  const formattedValue = formatComplex(value.value, 2);

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

export { ComplexNumberHandle };
