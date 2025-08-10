import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { Domkol } from '@/models/Domkol';
import { pageModels } from '@/models/DomainPageModel';
import { ControlDialog } from '@/components/ControlDialog';
import { ComplexNumberHandle } from '@/components/ComplexNumberHandle';
import { DomainCircleView } from '@/components/DomainCircleView';
import { CoordinateGrid } from '@/components/CoordinateGrid';
import { DomainColoringCanvas } from '@/components/DomainColoringCanvas';
import { FunctionGraphView } from '@/components/FunctionGraphView';
import { AppInfoDisplay } from '@/components/AppInfoDisplay';
import { LayerWrapper } from '@/components/LayerWrapper';
import './DomkolView.scss';

interface DomkolViewProps {
  domkol: Domkol;
}

const DomkolView = observer(({ domkol }: DomkolViewProps) => {

  return (
    <div className="app">
      <AppInfoDisplay showAbout={domkol.showAbout} />
      <header>
        <h1>Domkol: Complex Function Visualisation</h1>
        <nav className="function-nav">
          <span className="function-label">Function:</span>
          {pageModels.map((model, index) => (
            <button
              key={model.functionType}
              className={`function-link ${index === domkol.selectedPageIndex ? 'active' : ''}`}
              onClick={() => domkol.handlePageChange(index)}
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
              width: domkol.currentPageModel.canvasWidth,
              height: domkol.currentPageModel.canvasHeight
            }}
          >
            {/* Layer 1: Domain coloring canvas */}
            {domkol.domainColoringRenderer.showDomainColoring && (
              <DomainColoringCanvas
                complexFunction={domkol.currentFunction}
                viewport={domkol.viewport}
                colorScale={domkol.domainColoringRenderer.colorScale}
                repaintContinuously={domkol.domainColoringRenderer.repaintContinuously}
                changing={domkol.isZeroChanging}
              />
            )}

            {/* Layer 2: Cartesian coordinates and grid */}
            {domkol.domainColoringRenderer.showDomainGrid && (
              <LayerWrapper dimensions={domkol.currentPageModel.canvasDimensions} zIndex={2}>
                <CoordinateGrid
                  viewport={domkol.viewport}
                  showPolar={false}
                  showCartesian={true}
                />
              </LayerWrapper>
            )}

            {/* Layer 3: 3D graph "under" parts (only in 3D mode) */}
            {domkol.functionGraphRenderer.show3DGraph && (
              <LayerWrapper dimensions={domkol.currentPageModel.canvasDimensions} zIndex={3}>
                <FunctionGraphView
                  functionGraphRenderer={domkol.functionGraphRenderer}
                  complexFunction={domkol.currentFunction}
                  domainCircle={domkol.domainCircle}
                  viewport={domkol.viewport}
                  renderUnder={true}
                />
              </LayerWrapper>
            )}

            {/* Layer 4: Domain circle and polar grid */}
            <DomainCircleView
              domainCircle={domkol.domainCircle}
              functionGraphRenderer={domkol.functionGraphRenderer}
              polynomialFunction={domkol.currentFunction instanceof PolynomialFunction ? domkol.currentFunction : new PolynomialFunction([])}
              viewport={domkol.viewport}
            />

            {/* Layer 5: 3D graph "over" parts (only in 3D mode) */}
            {domkol.functionGraphRenderer.show3DGraph && (
              <LayerWrapper dimensions={domkol.currentPageModel.canvasDimensions} zIndex={5}>
                <FunctionGraphView
                  functionGraphRenderer={domkol.functionGraphRenderer}
                  complexFunction={domkol.currentFunction}
                  domainCircle={domkol.domainCircle}
                  viewport={domkol.viewport}
                  renderUnder={false}
                />
              </LayerWrapper>
            )}

            {/* Layer 6: Handles for controlling zero positions (only for polynomials) */}
            {domkol.showNumberHandles && domkol.currentFunction instanceof PolynomialFunction &&
              domkol.currentFunction.zeroModels.map((zeroModel, index) => (
                <ComplexNumberHandle
                  key={index}
                  value={zeroModel}
                  viewport={domkol.viewport}
                />
              ))
            }
          </div>

          {/* Control dialog */}
          <ControlDialog
            complexFunction={domkol.currentFunction}
            domainCircle={domkol.domainCircle}
            functionGraphRenderer={domkol.functionGraphRenderer}
            domainColoringRenderer={domkol.domainColoringRenderer}
            instructions={domkol.currentPageModel.instructions}
          />
        </div>
      </main>
    </div>
  );
});

export { DomkolView };
