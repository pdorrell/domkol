import React from 'react';
import { PixelDimensions } from '@/types/dimensions';

interface LayerWrapperProps {
  dimensions: PixelDimensions;
  zIndex: number;
  children: React.ReactNode;
}

// No need for observer as this component doesn't use MobX state
// eslint-disable-next-line mobx/missing-observer
export const LayerWrapper: React.FC<LayerWrapperProps> = ({ dimensions, zIndex, children }) => {
  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex,
        pointerEvents: 'none'
      }}
    >
      {children}
    </svg>
  );
};
