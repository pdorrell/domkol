import React from 'react';
import { observer } from 'mobx-react-lite';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { ComplexFunction } from '@/stores/ComplexFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import './FunctionGraphView.css';

interface FunctionGraphViewProps {
  functionGraphRenderer: FunctionGraphRenderer;
  complexFunction?: ComplexFunction | null;
  domainCircle: DomainCircle;
  viewport: ViewportConfig;
  renderUnder?: boolean;
}

const FunctionGraphView = observer(({
  functionGraphRenderer,
  complexFunction,
  domainCircle,
  viewport,
  renderUnder = false
}: FunctionGraphViewProps) => {
  if (!functionGraphRenderer.showGraphOnCircle || !complexFunction) {
    return null; // Don't render when graph is disabled or no function provided
  }

  const paths = functionGraphRenderer.generateGraphPaths(
    complexFunction,
    domainCircle,
    viewport
  );

  return (
    <g className="function-graph">
      {functionGraphRenderer.show3DGraph ? (
        <>
          {/* 3D Mode - render under or over based on renderUnder prop */}
          {renderUnder ? (
            <>
              {/* Under path (dashed, behind domain coloring) */}
              <path
                className="real-path-under"
                d={paths.realPathUnder3D}
              />
              {/* Shadow paths */}
              <path
                className="real-path-shadow2"
                d={paths.realPathShadow2}
              />
              <path
                className="real-path-shadow"
                d={paths.realPathShadow}
              />
            </>
          ) : (
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
          {/* 2D Mode: Always render (simple paths) */}
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
    </g>
  );
});

export { FunctionGraphView };
