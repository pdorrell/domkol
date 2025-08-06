import React from 'react';
import { observer } from 'mobx-react-lite';
import { ViewportConfig, getViewportBounds } from '@/utils/coordinateTransforms';
import './CoordinateGrid.css';

interface CoordinateGridProps {
  viewport: ViewportConfig;
  showPolar?: boolean;
  showCartesian?: boolean;
}

const CoordinateGrid = observer(({ viewport, showPolar = true, showCartesian = true }: CoordinateGridProps) => {
  const renderCartesianGrid = () => {
    const lines: JSX.Element[] = [];
    const { xMin, xMax, yMin, yMax } = getViewportBounds(viewport);
    
    const gridSpacing = 0.5;
    
    for (let x = Math.floor(xMin / gridSpacing) * gridSpacing; x <= xMax; x += gridSpacing) {
      const screenX = (x - xMin) / (xMax - xMin) * viewport.width;
      const isAxis = Math.abs(x) < 0.001;
      
      lines.push(
        <line
          key={`v-${x}`}
          x1={screenX}
          y1={0}
          x2={screenX}
          y2={viewport.height}
          className={isAxis ? 'cartesian-axis' : 'cartesian-grid'}
        />
      );
      
      if (!isAxis && Math.abs(x % 1) < 0.001) {
        lines.push(
          <text
            key={`vl-${x}`}
            x={screenX + 5}
            y={viewport.height / 2 - 5}
            className="grid-label"
          >
            {x.toFixed(0)}
          </text>
        );
      }
    }
    
    for (let y = Math.floor(yMin / gridSpacing) * gridSpacing; y <= yMax; y += gridSpacing) {
      const screenY = (yMax - y) / (yMax - yMin) * viewport.height;
      const isAxis = Math.abs(y) < 0.001;
      
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={screenY}
          x2={viewport.width}
          y2={screenY}
          className={isAxis ? 'cartesian-axis' : 'cartesian-grid'}
        />
      );
      
      if (!isAxis && Math.abs(y % 1) < 0.001) {
        lines.push(
          <text
            key={`hl-${y}`}
            x={viewport.width / 2 + 5}
            y={screenY - 5}
            className="grid-label"
          >
            {y.toFixed(0)}i
          </text>
        );
      }
    }
    
    return lines;
  };

  const renderPolarGrid = () => {
    const elements: JSX.Element[] = [];
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    
    const maxRadius = Math.min(viewport.width, viewport.height) / 2;
    const radiusStep = 0.5;
    const bounds = getViewportBounds(viewport);
    const scale = viewport.width / (bounds.xMax - bounds.xMin);
    
    for (let r = radiusStep; r * scale <= maxRadius; r += radiusStep) {
      const screenRadius = r * scale;
      elements.push(
        <circle
          key={`circle-${r}`}
          cx={centerX}
          cy={centerY}
          r={screenRadius}
          className="polar-circle"
        />
      );
      
      if (Math.abs(r % 1) < 0.001) {
        elements.push(
          <text
            key={`radius-label-${r}`}
            x={centerX + screenRadius + 5}
            y={centerY - 5}
            className="grid-label"
          >
            {r.toFixed(0)}
          </text>
        );
      }
    }
    
    const angleStep = Math.PI / 6;
    for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + maxRadius * Math.cos(angle);
      const y2 = centerY - maxRadius * Math.sin(angle);
      
      elements.push(
        <line
          key={`ray-${angle}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="polar-ray"
        />
      );
      
      const labelRadius = maxRadius * 0.9;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY - labelRadius * Math.sin(angle);
      const degrees = Math.round((angle * 180) / Math.PI);
      
      if (degrees % 30 === 0 && degrees !== 0) {
        elements.push(
          <text
            key={`angle-label-${angle}`}
            x={labelX}
            y={labelY}
            className="grid-label angle-label"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {degrees}°
          </text>
        );
      }
    }
    
    return elements;
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