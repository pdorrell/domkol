import React from 'react';
import { observer } from 'mobx-react-lite';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { useDraggableHandle } from '@/hooks/useDraggableHandle';
import './DomainHandle.scss';

interface DomainHandleProps {
  value: DraggableValueModel;
  viewport: ViewportConfig;
  className: string;
  zIndex: number;
}

const DomainHandle: React.FC<DomainHandleProps> = observer(({
  value,
  viewport,
  className,
  zIndex
}) => {
  const { handleRef, pixelX, pixelY, handlePointerDown } = useDraggableHandle({
    value,
    viewport,
    getCurrentPoint: (_event, rect) => {
      // The current point is the center of the handle element
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  });

  return (
    <div
      ref={handleRef}
      className={`domain-handle ${className}`}
      style={{
        position: 'absolute',
        left: pixelX - 8,
        top: pixelY - 8,
        cursor: 'move',
        zIndex
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    />
  );
});

export { DomainHandle };
