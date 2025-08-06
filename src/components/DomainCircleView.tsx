import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { Complex } from '@/utils/complex';
import { ViewportConfig, complexToPixel } from '@/utils/coordinateTransforms';
import DomainHandle from './DomainHandle';
import FunctionGraphView from './FunctionGraphView';
import './DomainCircleView.css';

interface DomainCircleViewProps {
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  polynomialFunction: PolynomialFunction;
  viewport: ViewportConfig;
}

const DomainCircleView: React.FC<DomainCircleViewProps> = observer(({
  domainCircle,
  functionGraphRenderer,
  polynomialFunction,
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
  
  // Render polar grid associated with this domain circle (matching original exactly)
  const renderPolarGrid = () => {
    const elements: JSX.Element[] = [];
    
    // Parameters exactly matching original domkol implementation
    const numRadialLinesPerQuarter = 6;
    const numRadialLines = numRadialLinesPerQuarter * 4; // 24 total lines
    const thetaIncrement = (Math.PI * 2) / numRadialLines;
    
    // Calculate grid dimensions - polar grid extends from 0.12 to 1.12
    const pixelsPerUnit = viewport.pixelsPerUnit;
    const outerGridRadius = 1.12 * pixelsPerUnit; // Outer edge at 1.12
    const innerGridRadius = 0.12 * pixelsPerUnit; // Inner edge at 0.12
    
    // Draw radial lines (spokes) - vertical and horizontal should be thicker
    for (let i = 0; i < numRadialLines; i++) {
      const theta = i * thetaIncrement;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      const lineStartX = centerPixelX + innerGridRadius * sinTheta;
      const lineEndX = centerPixelX + outerGridRadius * sinTheta;
      const lineStartY = centerPixelY + innerGridRadius * cosTheta;
      const lineEndY = centerPixelY + outerGridRadius * cosTheta;
      
      // Vertical and horizontal lines (every 90 degrees) should be thicker
      const isMainAxis = i % numRadialLinesPerQuarter === 0;
      
      elements.push(
        <line
          key={`radial-${i}`}
          x1={lineStartX}
          y1={lineStartY}
          x2={lineEndX}
          y2={lineEndY}
          stroke="white"
          strokeWidth={isMainAxis ? "0.6" : "0.2"}
          opacity={0.7}
        />
      );
    }
    
    // Draw concentric circles with fixed radii from 0.12 to 1.12
    // Domain circle is at 0.62, exactly in the middle of this range
    const polarGridRadii = [];
    for (let r = 0.12; r <= 1.12; r += 0.1) {
      polarGridRadii.push(r);
    }
    
    for (let i = 0; i < polarGridRadii.length; i++) {
      const gridRadius = polarGridRadii[i];
      const gridCircleRadius = gridRadius * pixelsPerUnit;
      
      // First and last circles should be thicker
      const isOutermost = i === 0 || i === polarGridRadii.length - 1;
      
      elements.push(
        <circle
          key={`circle-${gridRadius}`}
          cx={centerPixelX}
          cy={centerPixelY}
          r={gridCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth={isOutermost ? "0.6" : "0.2"}
          opacity={0.7}
        />
      );
    }
    
    return elements;
  };
  
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
        {/* Polar grid associated with domain circle */}
        <g className="polar-grid">
          {renderPolarGrid()}
        </g>
        
        
        {/* Domain circle outline */}
        <circle
          cx={centerPixelX}
          cy={centerPixelY}
          r={radiusPixels}
          fill="none"
          stroke="white"
          strokeWidth="3"
          opacity="1.0"
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