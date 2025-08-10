import React from 'react';
import { observer } from 'mobx-react-lite';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { DraggableValueModel } from '@/utils/draggable-value-model';
import { useDraggableHandle } from '@/hooks/useDraggableHandle';
import './DomainHandle.scss';

interface DomainHandleProps {
  value: DraggableValueModel;
  viewport: ViewportConfig;
  className?: string;
}

const DomainHandle: React.FC<DomainHandleProps> = observer(({
  value,
  viewport,
  className = 'center-handle'
}) => {
  const { handleRef, pixelX, pixelY, handlePointerDown } = useDraggableHandle({
    value,
    viewport,
    calculateDragOffset: (event, rect) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Calculate offset from pointer position to handle center
      const offsetX = clientX - (rect.left + rect.width / 2);
      const offsetY = clientY - (rect.top + rect.height / 2);
      return { offsetX, offsetY };
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
        zIndex: 900
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    />
  );
});

export { DomainHandle };
