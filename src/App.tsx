import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import { Complex, complex } from '@/utils/complex';
import { createDefaultViewport } from '@/utils/coordinateTransforms';
import ControlDialog from '@/components/ControlDialog';
import ComplexNumberHandle from '@/components/ComplexNumberHandle';
import DomainCircleView from '@/components/DomainCircleView';
import CoordinateGrid from '@/components/CoordinateGrid';
import DomainColoringCanvas from '@/components/DomainColoringCanvas';
import FunctionGraphView from '@/components/FunctionGraphView';
import './App.css';

const App = observer(() => {
  const [polynomialFunction] = React.useState(() => 
    new PolynomialFunction([
      complex(0, 0),
      complex(0, 0), 
      complex(0, 0)
    ])
  );

  const [domainCircle] = React.useState(() => 
    new DomainCircle(complex(0, 0), 0.62) // Center at origin, radius 0.62 (matching original)
  );

  const [functionGraphRenderer] = React.useState(() => 
    new FunctionGraphRenderer()
  );

  const [domainColoringRenderer] = React.useState(() => 
    new DomainColoringRenderer()
  );

  // Create viewport configuration for the complex plane (match CSS dimensions)
  const viewport = React.useMemo(() => createDefaultViewport(560, 560), []);

  // Track changing state for domain coloring
  const [isZeroChanging, setIsZeroChanging] = React.useState(false);
  
  // Handle changes to zero positions
  const handleZeroChange = React.useCallback((index: number, newValue: Complex, changing: boolean) => {
    polynomialFunction.updateZero(index, newValue, changing);
    setIsZeroChanging(changing);
  }, [polynomialFunction]);

  // Wiggle animation effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (functionGraphRenderer.wiggling) {
        functionGraphRenderer.wiggleOneStep();
      }
    }, 80); // 80ms = ~12.5 FPS, matching original domkol

    return () => clearInterval(interval);
  }, [functionGraphRenderer]);

  return (
    <div className="app">
      <header>
        <h1>Domkol: Complex Function Visualisation</h1>
        <div className="function-links">
          Function: <span className="current-function">Cubic Polynomial</span>
        </div>
      </header>
      
      <main className="main-content">
        <div className="visualization-area">
          <div className="complex-plane" id="domkol">
            {/* Domain coloring canvas (z-index: 2) */}
            {domainColoringRenderer.showDomainColoring && (
              <DomainColoringCanvas
                polynomialFunction={polynomialFunction}
                viewport={viewport}
                colorScale={domainColoringRenderer.colorScale}
                repaintContinuously={domainColoringRenderer.repaintContinuously}
                changing={isZeroChanging}
              />
            )}
            
            {/* SVG under layer (z-index: 1.5) - for 3D graph "under" parts */}
            <svg width={560} height={560} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1.5 }}>
              {/* Function graph "under" parts - below domain coloring */}
              {functionGraphRenderer.showGraphOnCircle && functionGraphRenderer.show3DGraph && (
                <FunctionGraphView
                  functionGraphRenderer={functionGraphRenderer}
                  polynomialFunction={polynomialFunction}
                  domainCircle={domainCircle}
                  viewport={viewport}
                  renderMode="under"
                />
              )}
            </svg>
            
            <svg width={560} height={560} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
              {/* Cartesian coordinate grid - above domain coloring */}
              <CoordinateGrid
                viewport={viewport}
                showPolar={false}
                showCartesian={true}
              />
            </svg>
            
            {/* Domain circle with draggable center and radius handles */}
            <DomainCircleView
              domainCircle={domainCircle}
              functionGraphRenderer={functionGraphRenderer}
              polynomialFunction={polynomialFunction}
              viewport={viewport}
            />
            
            {/* SVG over layer (z-index: 4) - for 3D graph "over" parts */}
            <svg width={560} height={560} style={{ position: 'absolute', top: 0, left: 0, zIndex: 4 }}>
              {/* Function graph "over" parts and 2D graphs - above domain coloring */}
              {functionGraphRenderer.showGraphOnCircle && (
                <FunctionGraphView
                  functionGraphRenderer={functionGraphRenderer}
                  polynomialFunction={polynomialFunction}
                  domainCircle={domainCircle}
                  viewport={viewport}
                  renderMode={functionGraphRenderer.show3DGraph ? "over" : "2d"}
                />
              )}
            </svg>
            
            {/* Zero handles for the polynomial */}
            {polynomialFunction.zeroes.map((zero, index) => (
              <ComplexNumberHandle
                key={index}
                index={index}
                value={zero}
                viewport={viewport}
                onChange={handleZeroChange}
              />
            ))}
          </div>
          
          <ControlDialog 
            polynomialFunction={polynomialFunction}
            functionGraphRenderer={functionGraphRenderer}
            domainColoringRenderer={domainColoringRenderer}
          />
        </div>
      </main>
    </div>
  );
});

export default App;