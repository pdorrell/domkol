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
  zIndex: number;
}

const ComplexNumberHandle: React.FC<ComplexNumberHandleProps> = observer(({
  value,
  viewport,
  zIndex
}) => {
  const { handleRef, pixelX, pixelY, handlePointerDown } = useDraggableHandle({
    value,
    viewport,
    getCurrentPoint: (_event, rect) => {
      // The current point is the center of the point circle
      // The point circle is at left: -4px, top: 21px relative to the container
      return {
        x: rect.left - 4 + 2, // -4px offset + 2px radius to get center
        y: rect.top + 21 + 2  // 21px offset + 2px radius to get center
      };
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
        zIndex
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
