import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import './ControlDialog.css';

interface ControlDialogProps {
  polynomialFunction: PolynomialFunction;
  functionGraphRenderer: FunctionGraphRenderer;
  domainColoringRenderer: DomainColoringRenderer;
}

const ControlDialog = observer(({ polynomialFunction, functionGraphRenderer, domainColoringRenderer }: ControlDialogProps) => {
  return (
    <div className="control-dialog">
      <div className="window-top-bar">
        Control Panel
      </div>
      
      <div className="controls">
        <div className="control-line">
          <div className="formula-label">Function:</div>
          <span className="formula">
            f(z) = {polynomialFunction.formula}
          </span>
        </div>
        
        <div className="instructions">
          Drag the small black circles to move and resize the large white circle.
        </div>
        
        <div className="instructions">
          Drag the blue numbers to change the zeroes of the cubic polynomial 
          (initially they are all located on the origin).
        </div>
        
        <div className="control-section">
          <div className="control-line">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={functionGraphRenderer.showGraphOnCircle}
                onChange={(e) => functionGraphRenderer.setShowGraphOnCircle(e.target.checked)}
              />
              <span className="checkmark"></span>
              Show graph on circular domain
            </label>
          </div>
          
          {functionGraphRenderer.showGraphOnCircle && (
            <>
              <div className="control-line">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={functionGraphRenderer.show3DGraph}
                    onChange={(e) => functionGraphRenderer.setShow3DGraph(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Show graph on circular domain in 3D
                </label>
              </div>
              
              {functionGraphRenderer.show3DGraph && (
                <div className="control-line">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={functionGraphRenderer.wiggling}
                      onChange={(e) => functionGraphRenderer.setWiggling(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    3D Wiggle Animation
                  </label>
                </div>
              )}
              
              <div className="control-line">
                <label htmlFor="scale-slider">Graph scale:</label>
                <input
                  id="scale-slider"
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={functionGraphRenderer.scaleF}
                  onChange={(e) => functionGraphRenderer.setScaleF(parseFloat(e.target.value))}
                />
                <span className="slider-value">{functionGraphRenderer.scaleF.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="control-section">
          <div className="control-line">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={domainColoringRenderer.showDomainColoring}
                onChange={(e) => domainColoringRenderer.setShowDomainColoring(e.target.checked)}
              />
              <span className="checkmark"></span>
              Show domain coloring
            </label>
          </div>
          
          {domainColoringRenderer.showDomainColoring && (
            <>
              <div className="control-line">
                <label htmlFor="color-scale-slider">Color scale:</label>
                <input
                  id="color-scale-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={domainColoringRenderer.colorScaleSliderValue}
                  onChange={(e) => domainColoringRenderer.setColorScaleFromSlider(parseInt(e.target.value))}
                />
                <span className="slider-value">{domainColoringRenderer.colorScale.toFixed(2)}</span>
              </div>
              
              <div className="control-line">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={domainColoringRenderer.repaintContinuously}
                    onChange={(e) => domainColoringRenderer.setRepaintContinuously(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Repaint domain coloring continuously
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default ControlDialog;