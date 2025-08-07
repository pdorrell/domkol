import React from 'react';
import { observer } from 'mobx-react-lite';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { formatComplex, Complex } from '@/utils/complex';
import './CoordinateGrid.css';

interface CoordinateGridProps {
  viewport: ViewportConfig;
  showPolar?: boolean;
  showCartesian?: boolean;
}

const CoordinateGrid = observer(({ viewport, showPolar = true, showCartesian = true }: CoordinateGridProps) => {
  // Translated from original domkol drawGrid function
  const drawGrid = (spacing: number, showCoordinateLabels: boolean) => {
    const paths: string[] = [];
    const labels: JSX.Element[] = [];

    const [originX, originY] = viewport.originPixelLocation;
    const pixelsPerUnit = viewport.pixelsPerUnit;
    const maxX = viewport.width;
    const maxY = viewport.height;

    // Calculate grid bounds (translated from original logic)
    const minXIndex = Math.ceil((0 - originX) / (pixelsPerUnit * spacing));
    const maxXIndex = Math.floor((maxX - originX) / (pixelsPerUnit * spacing));
    const minYIndex = Math.ceil((originY - maxY) / (pixelsPerUnit * spacing));
    const maxYIndex = Math.floor(originY / (pixelsPerUnit * spacing));

    // Vertical lines
    for (let i = minXIndex; i <= maxXIndex; i++) {
      const xPixels = originX + i * pixelsPerUnit * spacing;
      paths.push(`M${xPixels},0 L${xPixels},${maxY}`);

      // Add coordinate labels if requested and not at origin
      if (showCoordinateLabels && i !== 0) {
        const realPart = i * spacing;
        const complexNumber: Complex = [realPart, 0];
        const label = formatComplex(complexNumber, 2);

        labels.push(
          <text
            key={`v-label-${i}`}
            x={xPixels + 3}
            y={originY - 3}
            className="coordinate-label"
            textAnchor="start"
            dominantBaseline="alphabetic"
          >
            {label}
          </text>
        );
      }
    }

    // Horizontal lines
    for (let i = minYIndex; i <= maxYIndex; i++) {
      const yPixels = originY - i * pixelsPerUnit * spacing; // Y flipped
      paths.push(`M0,${yPixels} L${maxX},${yPixels}`);

      // Add coordinate labels if requested and not at origin
      if (showCoordinateLabels && i !== 0) {
        const imagPart = i * spacing;
        const complexNumber: Complex = [0, imagPart];
        const label = formatComplex(complexNumber, 2);

        labels.push(
          <text
            key={`h-label-${i}`}
            x={originX + 3}
            y={yPixels - 3}
            className="coordinate-label"
            textAnchor="start"
            dominantBaseline="alphabetic"
          >
            {label}
          </text>
        );
      }
    }

    // Combined grid lines and corner labels
    for (let i = minXIndex; i <= maxXIndex; i++) {
      for (let j = minYIndex; j <= maxYIndex; j++) {
        if (showCoordinateLabels && i !== 0 && j !== 0) {
          const xPixels = originX + i * pixelsPerUnit * spacing;
          const yPixels = originY - j * pixelsPerUnit * spacing; // Y flipped

          const realPart = i * spacing;
          const imagPart = j * spacing;
          const complexNumber: Complex = [realPart, imagPart];
          const label = formatComplex(complexNumber, 2);

          labels.push(
            <text
              key={`corner-label-${i}-${j}`}
              x={xPixels + 3}
              y={yPixels - 3}
              className="coordinate-label"
              textAnchor="start"
              dominantBaseline="alphabetic"
            >
              {label}
            </text>
          );
        }
      }
    }

    return { pathData: paths.join(' '), labels };
  };

  const renderCartesianGrid = () => {
    const elements: JSX.Element[] = [];

    // Axes (thickest - stroke-width: 0.6)
    const [originX, originY] = viewport.originPixelLocation;
    elements.push(
      <g key="axes" className="axes">
        {/* Real axis (horizontal) */}
        <line x1={0} y1={originY} x2={viewport.width} y2={originY} />
        {/* Imaginary axis (vertical) */}
        <line x1={originX} y1={0} x2={originX} y2={viewport.height} />
      </g>
    );

    // Fine grid (0.1 spacing, thin lines - stroke-width: 0.2)
    const fineGrid = drawGrid(0.1, false);
    elements.push(
      <path
        key="fine-grid"
        d={fineGrid.pathData}
        className="fine-coordinate-grid"
      />
    );

    // Unit grid (1.0 spacing, medium lines - stroke-width: 0.5, with labels)
    const unitGrid = drawGrid(1.0, true);
    elements.push(
      <g key="unit-grid">
        <path
          d={unitGrid.pathData}
          className="unit-coordinate-grid"
        />
        {unitGrid.labels}
      </g>
    );

    return elements;
  };

  const renderPolarGrid = () => {
    // Polar grid is handled by domain circle - this is just a placeholder
    return null;
  };

  return (
    <g className="coordinate-grid">
      {showCartesian && (
        <g className="cartesian-grid-group">
          {renderCartesianGrid()}
        </g>
      )}
      {showPolar && (
        <g className="polar-grid-group">
          {renderPolarGrid()}
        </g>
      )}
    </g>
  );
});

export default CoordinateGrid;
