import React, { useRef, useEffect } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const dialog = dialogRef.current;
    const dragHandle = dragHandleRef.current;
    
    if (!dialog || !dragHandle) return;
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      // Use offsetLeft/offsetTop for the current position relative to the positioned parent
      initialLeft = dialog.offsetLeft;
      initialTop = dialog.offsetTop;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      dialog.style.left = `${initialLeft + deltaX}px`;
      dialog.style.top = `${initialTop + deltaY}px`;
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    dragHandle.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={dialogRef} className="control-dialog">
      <div ref={dragHandleRef} className="drag-handle"></div>
      
      <div className="controls">
        <div className="control-line">
          <span className="function-label">Function</span>
          <span className="function-formula">{polynomialFunction.formula}</span>
        </div>
        
        <div className="instructions">
          <em>Drag the small black circles to move and resize the large white circle.</em>
        </div>
        
        <div className="instructions">
          <em>Drag the blue numbers to change the zeroes of the cubic polynomial 
          (initially they are all located on the origin).</em>
        </div>
        
        <div className="control-line">
          <label htmlFor="scale-slider">Graph scale:</label>
          <input
            id="scale-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={functionGraphRenderer.scaleFSliderValue}
            onChange={(e) => functionGraphRenderer.setScaleFFromSlider(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-line">
          <label htmlFor="color-scale-slider">Colour scale:</label>
          <input
            id="color-scale-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={domainColoringRenderer.colorScaleSliderValue}
            onChange={(e) => domainColoringRenderer.setColorScaleFromSlider(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-line">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={functionGraphRenderer.showGraphOnCircle}
              onChange={(e) => functionGraphRenderer.setShowGraphOnCircle(e.target.checked)}
            />
            Show graph on circular domain
          </label>
        </div>
        
        <div className="control-line">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={functionGraphRenderer.show3DGraph}
              onChange={(e) => functionGraphRenderer.setShow3DGraph(e.target.checked)}
            />
            Show graph on circular domain in 3D
          </label>
        </div>
        
        <div className="control-line">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={functionGraphRenderer.wiggling}
              onChange={(e) => functionGraphRenderer.setWiggling(e.target.checked)}
            />
            3D Wiggle animation
          </label>
        </div>
        
        <div className="control-line">
          <label htmlFor="rotate-slider">Rotate f values:</label>
          <input
            id="rotate-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={functionGraphRenderer.graphRotationSliderValue}
            onChange={(e) => functionGraphRenderer.setGraphRotationFromSlider(parseInt(e.target.value))}
          />
        </div>
        
        <div className="control-line">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={domainColoringRenderer.showDomainGrid}
              onChange={(e) => domainColoringRenderer.setShowDomainGrid(e.target.checked)}
            />
            Show domain coordinate grid
          </label>
        </div>
        
        <div className="control-line">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={domainColoringRenderer.repaintContinuously}
              onChange={(e) => domainColoringRenderer.setRepaintContinuously(e.target.checked)}
            />
            Repaint domain colouring continuously
          </label>
        </div>
        
        <div className="instructions final-instructions">
          <em>Type "c" to recentre a slider to its initial default value.<br/>
          Drag the white bar to move this control dialog around.</em>
        </div>
      </div>
    </div>
  );
});

export default ControlDialog;