import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { ExponentialFunction } from '@/stores/ExponentialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import { Complex, complex } from '@/utils/complex';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { pageModels } from '@/models/DomainPageModel';
import ControlDialog from '@/components/ControlDialog';
import ComplexNumberHandle from '@/components/ComplexNumberHandle';
import DomainCircleView from '@/components/DomainCircleView';
import CoordinateGrid from '@/components/CoordinateGrid';
import DomainColoringCanvas from '@/components/DomainColoringCanvas';
import FunctionGraphView from '@/components/FunctionGraphView';
import VersionDisplay from '@/components/VersionDisplay';
import './DomkolView.css';

const DomkolView = observer(() => {
  // State for selected page model (default to cubic polynomial)
  const [selectedPageIndex, setSelectedPageIndex] = React.useState(0);
  const currentPageModel = pageModels[selectedPageIndex];

  // Create function based on page model type
  const [currentFunction, setCurrentFunction] = React.useState<PolynomialFunction | ExponentialFunction>(() => {
    if (currentPageModel.functionType === 'exponential') {
      return new ExponentialFunction();
    } else {
      return new PolynomialFunction(currentPageModel.initialZeroes);
    }
  });

  // Domain circle with initial radius from page model
  const [domainCircle, setDomainCircle] = React.useState(() =>
    new DomainCircle(complex(0, 0), currentPageModel.initialCircleRadius)
  );

  const [functionGraphRenderer] = React.useState(() =>
    new FunctionGraphRenderer()
  );

  const [domainColoringRenderer] = React.useState(() =>
    new DomainColoringRenderer()
  );

  // Create viewport configuration based on current page model
  const viewport = React.useMemo<ViewportConfig>(() => ({
    originPixelLocation: currentPageModel.originPixelLocation,
    pixelsPerUnit: currentPageModel.pixelsPerUnit,
    width: currentPageModel.canvasWidth,
    height: currentPageModel.canvasHeight
  }), [currentPageModel]);

  // Track changing state for domain coloring
  const [isZeroChanging, setIsZeroChanging] = React.useState(false);

  // Handle page model change
  const handlePageChange = React.useCallback((index: number) => {
    setSelectedPageIndex(index);
    const newPageModel = pageModels[index];

    // Create new function instance based on type
    if (newPageModel.functionType === 'exponential') {
      setCurrentFunction(new ExponentialFunction());
    } else {
      setCurrentFunction(new PolynomialFunction(newPageModel.initialZeroes));
    }

    // Reset domain circle with new radius
    setDomainCircle(new DomainCircle(complex(0, 0), newPageModel.initialCircleRadius));
    setIsZeroChanging(false);
  }, []);

  // Handle changes to zero positions (only for polynomial functions)
  const handleZeroChange = React.useCallback((index: number, newValue: Complex, changing: boolean) => {
    if (currentFunction instanceof PolynomialFunction) {
      currentFunction.updateZero(index, newValue, changing);
      setIsZeroChanging(changing);
    }
  }, [currentFunction]);

  // Handle animation updates from the graph renderer
  React.useEffect(() => {
    const interval = setInterval(() => {
      functionGraphRenderer.wiggleOneStep();
    }, 50);

    return () => clearInterval(interval);
  }, [functionGraphRenderer]);

  // Determine if we should show number handles
  const showNumberHandles = currentFunction instanceof PolynomialFunction;

  return (
    <div className="app">
      <VersionDisplay />
      <header>
        <h1>Domkol: Complex Function Visualisation</h1>
        <nav className="function-nav">
          <span className="function-label">Function:</span>
          {pageModels.map((model, index) => (
            <button
              key={model.functionType}
              className={`function-link ${index === selectedPageIndex ? 'active' : ''}`}
              onClick={() => handlePageChange(index)}
            >
              {model.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <div className="visualization-area">
          <div
            className="complex-plane"
            id="domkol"
            style={{
              width: currentPageModel.canvasWidth,
              height: currentPageModel.canvasHeight
            }}
          >
            {/* Layer 1: Domain coloring canvas */}
            {domainColoringRenderer.showDomainColoring && (
              <DomainColoringCanvas
                complexFunction={currentFunction}
                viewport={viewport}
                colorScale={domainColoringRenderer.colorScale}
                repaintContinuously={domainColoringRenderer.repaintContinuously}
                changing={isZeroChanging}
              />
            )}

            {/* Layer 2: Cartesian coordinates and grid */}
            {domainColoringRenderer.showDomainGrid && (
              <svg
                width={currentPageModel.canvasWidth}
                height={currentPageModel.canvasHeight}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
              >
                <CoordinateGrid
                  viewport={viewport}
                  showPolar={false}
                  showCartesian={true}
                />
              </svg>
            )}

            {/* Layer 3: 3D graph "under" parts (only in 3D mode) */}
            {functionGraphRenderer.show3DGraph && (
              <svg
                width={currentPageModel.canvasWidth}
                height={currentPageModel.canvasHeight}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 3, pointerEvents: 'none' }}
              >
                <FunctionGraphView
                  functionGraphRenderer={functionGraphRenderer}
                  complexFunction={currentFunction}
                  domainCircle={domainCircle}
                  viewport={viewport}
                  renderUnder={true}
                />
              </svg>
            )}

            {/* Layer 4: Domain circle and polar grid */}
            <DomainCircleView
              domainCircle={domainCircle}
              functionGraphRenderer={functionGraphRenderer}
              polynomialFunction={currentFunction instanceof PolynomialFunction ? currentFunction : new PolynomialFunction([])}
              viewport={viewport}
            />

            {/* Layer 5: 3D graph "over" parts (only in 3D mode) */}
            {functionGraphRenderer.show3DGraph && (
              <svg
                width={currentPageModel.canvasWidth}
                height={currentPageModel.canvasHeight}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}
              >
                <FunctionGraphView
                  functionGraphRenderer={functionGraphRenderer}
                  complexFunction={currentFunction}
                  domainCircle={domainCircle}
                  viewport={viewport}
                  renderUnder={false}
                />
              </svg>
            )}

            {/* Layer 6: Handles for controlling zero positions (only for polynomials) */}
            {showNumberHandles && currentFunction instanceof PolynomialFunction &&
              currentFunction.zeroes.map((zero, index) => (
                <ComplexNumberHandle
                  key={index}
                  index={index}
                  value={zero}
                  viewport={viewport}
                  onChange={handleZeroChange}
                />
              ))
            }
          </div>

          {/* Control dialog */}
          <ControlDialog
            complexFunction={currentFunction}
            domainCircle={domainCircle}
            functionGraphRenderer={functionGraphRenderer}
            domainColoringRenderer={domainColoringRenderer}
            instructions={currentPageModel.instructions}
          />
        </div>
      </main>
    </div>
  );
});

export default DomkolView;
