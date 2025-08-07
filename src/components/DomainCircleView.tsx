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
    
    // Calculate grid dimensions - polar grid extends ±0.5 units from domain circle
    const pixelsPerUnit = viewport.pixelsPerUnit;
    const domainRadius = domainCircle.radiusInUnits;
    const outerGridRadius = (domainRadius + 0.5) * pixelsPerUnit;
    const innerGridRadius = Math.max(0.01, domainRadius - 0.5) * pixelsPerUnit; // Minimum 0.01 to avoid zero
    
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
    
    // Draw concentric circles representing f-values from -0.5 to 0.5 in steps of 0.05
    // This gives 10 circles on each side of the domain circle (20 total + center)
    // Scale by functionGraphRenderer.scaleF to match function scaling
    const scaleF = functionGraphRenderer.scaleF;
    const polarGridRadii = [];
    
    // Create 21 circles (from -0.5 to 0.5 in 0.05 increments)
    for (let fValue = -0.5; fValue <= 0.5; fValue += 0.05) {
      // Calculate radius: domain circle radius + (f-value * scale * pixelsPerUnit)
      const scaledFValueInPixels = fValue * scaleF * pixelsPerUnit;
      const circleRadius = domainRadius + scaledFValueInPixels / pixelsPerUnit;
      
      // Only add positive radii (negative circles are not displayed)
      if (circleRadius > 0) {
        polarGridRadii.push({ radius: circleRadius, fValue: Math.round(fValue * 20) / 20 });
      }
    }
    
    for (let i = 0; i < polarGridRadii.length; i++) {
      const gridItem = polarGridRadii[i];
      const gridCircleRadius = gridItem.radius * pixelsPerUnit;
      
      // f-values at 0.1 intervals (like -0.5, -0.4, ..., 0.0, ..., 0.4, 0.5) should be thicker
      const isMainGridLine = Math.abs((gridItem.fValue * 10) % 1.0) < 0.001;
      
      elements.push(
        <circle
          key={`circle-${gridItem.fValue}`}
          cx={centerPixelX}
          cy={centerPixelY}
          r={gridCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth={isMainGridLine ? "0.4" : "0.2"}
          opacity={0.7}
        />
      );
    }
    
    return elements;
  };
  
  return (
    <div className="domain-circle-view">
      {/* SVG for polar grid */}
      <svg
        className="domain-circle-svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 4
        }}
      >
        {/* Polar grid associated with domain circle */}
        <g className="polar-grid">
          {renderPolarGrid()}
        </g>
      </svg>
      
      {/* SVG for domain circle outline - separate layer */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 4
        }}
      >
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