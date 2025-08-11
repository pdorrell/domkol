import React from 'react';
import { observer } from 'mobx-react-lite';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { ViewportConfig, complexToPixel } from '@/utils/coordinateTransforms';
import './DomainCircleView.scss';

interface DomainCircleViewProps {
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  viewport: ViewportConfig;
}

const DomainCircleView: React.FC<DomainCircleViewProps> = observer(({
  domainCircle,
  functionGraphRenderer,
  viewport
}) => {
  // Convert circle center from complex coordinates to pixel coordinates
  const [centerPixelX, centerPixelY] = complexToPixel(domainCircle.center, viewport);

  // Convert radius from complex units to pixels
  const radiusPixels = domainCircle.radiusInUnits * viewport.pixelsPerUnit;


  // Render polar grid associated with this domain circle (matching original exactly)
  const renderPolarGrid = () => {
    const elements: React.JSX.Element[] = [];

    // Parameters exactly matching original domkol implementation
    const numRadialLinesPerQuarter = 6;
    const numRadialLines = numRadialLinesPerQuarter * 4; // 24 total lines
    const thetaIncrement = (Math.PI * 2) / numRadialLines;

    // Calculate grid dimensions - polar grid extends ±0.5 units from domain circle
    const pixelsPerUnit = viewport.pixelsPerUnit;
    const domainRadius = domainCircle.radiusInUnits;
    const _outerGridRadius = (domainRadius + 0.5) * pixelsPerUnit;
    const _innerGridRadius = Math.max(0.01, domainRadius - 0.5) * pixelsPerUnit; // Minimum 0.01 to avoid zero

    // Find innermost and outermost grid circles to determine radial line extent
    const scaleF = functionGraphRenderer.scaleF;

    let minGridRadius = Infinity;
    let maxGridRadius = -Infinity;

    for (let fValue = -0.5; fValue <= 0.5; fValue += 0.05) {
      const scaledFValueInPixels = fValue * scaleF * viewport.pixelsPerUnit;
      const circleRadius = domainRadius + scaledFValueInPixels / viewport.pixelsPerUnit;

      if (circleRadius > 0) {
        const radiusInPixels = circleRadius * viewport.pixelsPerUnit;
        minGridRadius = Math.min(minGridRadius, radiusInPixels);
        maxGridRadius = Math.max(maxGridRadius, radiusInPixels);
      }
    }

    // Draw radial lines (spokes) from innermost to outermost grid circle
    for (let i = 0; i < numRadialLines; i++) {
      const theta = i * thetaIncrement;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      const lineStartX = centerPixelX + minGridRadius * sinTheta;
      const lineEndX = centerPixelX + maxGridRadius * sinTheta;
      const lineStartY = centerPixelY + minGridRadius * cosTheta;
      const lineEndY = centerPixelY + maxGridRadius * cosTheta;

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

      // Innermost and outermost circles should be thicker (twice as thick)
      const isInnermost = i === 0;
      const isOutermost = i === polarGridRadii.length - 1;
      const isExtreme = isInnermost || isOutermost;

      let strokeWidth = "0.2";
      if (isExtreme) {
        strokeWidth = isMainGridLine ? "0.8" : "0.4"; // Double thickness for extreme circles
      } else if (isMainGridLine) {
        strokeWidth = "0.4";
      }

      elements.push(
        <circle
          key={`circle-${gridItem.fValue}`}
          cx={centerPixelX}
          cy={centerPixelY}
          r={gridCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          opacity={0.7}
        />
      );
    }

    return elements;
  };

  return (
    <>
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
        strokeWidth="5"
        opacity="1.0"
      />
    </>
  );
});

export { DomainCircleView };
