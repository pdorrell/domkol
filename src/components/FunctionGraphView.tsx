import React from 'react';
import { observer } from 'mobx-react-lite';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import './FunctionGraphView.css';

interface FunctionGraphViewProps {
  functionGraphRenderer: FunctionGraphRenderer;
  polynomialFunction: PolynomialFunction;
  domainCircle: DomainCircle;
  viewport: ViewportConfig;
}

const FunctionGraphView = observer(({
  functionGraphRenderer,
  polynomialFunction,
  domainCircle,
  viewport
}: FunctionGraphViewProps) => {
  if (!functionGraphRenderer.showGraphOnCircle) {
    return null;
  }

  const paths = functionGraphRenderer.generateGraphPaths(
    polynomialFunction,
    domainCircle,
    viewport
  );

  return (
    <g className="function-graph">
      {functionGraphRenderer.show3DGraph ? (
        <>
          {/* 3D Mode: Under path (dashed, behind everything) */}
          <path
            className="real-path-under"
            d={paths.realPathUnder3D}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.6"
          />
          
          {/* 3D Mode: Shadow paths */}
          <path
            className="real-path-shadow2"
            d={paths.realPathShadow2}
            fill="none"
            stroke="#000"
            strokeWidth="3"
            opacity="0.2"
          />
          <path
            className="real-path-shadow"
            d={paths.realPathShadow}
            fill="none"
            stroke="#000"
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* 3D Mode: Over path (solid, in front) */}
          <path
            className="real-path"
            d={paths.realPath3D}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            opacity="1.0"
          />
        </>
      ) : (
        <>
          {/* 2D Mode: Separate real and imaginary paths */}
          <path
            className="real-path"
            d={paths.real}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            className="imaginary-path"
            d={paths.imaginary}
            fill="none"
            stroke="#4ecdc4"
            strokeWidth="2"
            opacity="0.8"
          />
        </>
      )}
    </g>
  );
});

export default FunctionGraphView;