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
  renderMode?: 'under' | 'over' | '2d' | 'shadows';
}

const FunctionGraphView = observer(({
  functionGraphRenderer,
  polynomialFunction,
  domainCircle,
  viewport,
  renderMode = '2d'
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
          {/* 3D Mode - render based on mode */}
          {renderMode === 'under' && (
            <>
              {/* Under path (dashed, behind domain coloring) */}
              <path
                className="real-path-under"
                d={paths.realPathUnder3D}
              />
            </>
          )}
          {renderMode === 'shadows' && (
            <>
              {/* Shadow paths only */}
              <path
                className="real-path-shadow2"
                d={paths.realPathShadow2}
              />
              <path
                className="real-path-shadow"
                d={paths.realPathShadow}
              />
            </>
          )}
          {renderMode === 'over' && (
            <>
              {/* Over path (solid, in front of domain coloring) */}
              <path
                className="real-path-3d-over"
                d={paths.realPath3D}
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* 2D Mode: Only render in "2d" or "over" mode */}
          {(renderMode === '2d' || renderMode === 'over') && (
            <>
              <path
                className="real-path"
                d={paths.real}
              />
              <path
                className="imaginary-path"
                d={paths.imaginary}
              />
            </>
          )}
        </>
      )}
    </g>
  );
});

export default FunctionGraphView;
