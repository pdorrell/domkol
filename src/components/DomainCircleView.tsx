import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { DomainCircle } from '@/stores/DomainCircle';
import { Complex } from '@/utils/complex';
import { ViewportConfig, complexToPixel } from '@/utils/coordinateTransforms';
import DomainHandle from './DomainHandle';
import './DomainCircleView.css';

interface DomainCircleViewProps {
  domainCircle: DomainCircle;
  viewport: ViewportConfig;
}

const DomainCircleView: React.FC<DomainCircleViewProps> = observer(({
  domainCircle,
  viewport
}) => {
  // Convert circle center from complex coordinates to pixel coordinates
  const [centerPixelX, centerPixelY] = complexToPixel(domainCircle.center, viewport);
  
  // Convert radius from complex units to pixels
  const radiusPixels = domainCircle.radiusInUnits * viewport.pixelsPerUnit;
  
  // Calculate edge handle position (point on circle circumference at angle 0)
  const edgeComplex: Complex = [
    domainCircle.center[0] + domainCircle.radiusInUnits,
    domainCircle.center[1]
  ];
  
  // Handle center position changes
  const handleCenterChange = useCallback((index: number, newValue: Complex, changing: boolean) => {
    domainCircle.setCenter(newValue);
  }, [domainCircle]);
  
  // Handle edge position changes (affects radius)
  const handleEdgeChange = useCallback((index: number, newValue: Complex, changing: boolean) => {
    // Calculate new radius based on distance from center to new edge position
    const dx = newValue[0] - domainCircle.center[0];
    const dy = newValue[1] - domainCircle.center[1];
    const newRadius = Math.sqrt(dx * dx + dy * dy);
    
    if (newRadius > 0.01) { // Minimum radius threshold
      domainCircle.setRadius(newRadius);
    }
  }, [domainCircle]);
  
  return (
    <div className="domain-circle-view">
      {/* SVG for the white domain circle */}
      <svg
        className="domain-circle-svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <circle
          cx={centerPixelX}
          cy={centerPixelY}
          r={radiusPixels}
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>
      
      {/* Draggable center handle */}
      <DomainHandle
        index={0}
        value={domainCircle.center}
        viewport={viewport}
        onChange={handleCenterChange}
        className="center-handle"
      />
      
      {/* Draggable edge handle for radius control */}
      <DomainHandle
        index={1}
        value={edgeComplex}
        viewport={viewport}
        onChange={handleEdgeChange}
        className="edge-handle"
      />
    </div>
  );
});

export default DomainCircleView;