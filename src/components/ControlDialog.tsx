import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { ExponentialFunction } from '@/stores/ExponentialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import './ControlDialog.css';

interface ControlDialogProps {
  polynomialFunction?: PolynomialFunction | null;
  exponentialFunction?: ExponentialFunction | null;
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  domainColoringRenderer: DomainColoringRenderer;
  instructions: string;
}

const ControlDialog = observer(({
  polynomialFunction,
  exponentialFunction,
  domainCircle: _domainCircle,
  functionGraphRenderer,
  domainColoringRenderer,
  instructions
}: ControlDialogProps) => {
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

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      e.preventDefault(); // Prevent scrolling

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;
      // Use offsetLeft/offsetTop for the current position relative to the positioned parent
      initialLeft = dialog.offsetLeft;
      initialTop = dialog.offsetTop;
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent scrolling

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      dialog.style.left = `${initialLeft + deltaX}px`;
      dialog.style.top = `${initialTop + deltaY}px`;
    };

    const handlePointerUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };

    dragHandle.addEventListener('mousedown', handlePointerDown);
    dragHandle.addEventListener('touchstart', handlePointerDown, { passive: false });

    return () => {
      dragHandle.removeEventListener('mousedown', handlePointerDown);
      dragHandle.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  // Handle "c" key to reset sliders to default
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT' && activeElement.getAttribute('type') === 'range') {
          const sliderId = activeElement.id;
          switch (sliderId) {
            case 'scale-slider':
              functionGraphRenderer.setScaleFFromSlider(50);
              break;
            case 'color-scale-slider':
              domainColoringRenderer.setColorScaleFromSlider(50);
              break;
            case 'rotate-slider':
              functionGraphRenderer.setGraphRotationFromSlider(50);
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [functionGraphRenderer, domainColoringRenderer]);

  return (
    <div ref={dialogRef} className="control-dialog">
      <div ref={dragHandleRef} className="drag-handle"></div>

      <div className="controls">
        <div className="control-line">
          <span className="function-label">Function</span>
          <span className="function-formula">
            {polynomialFunction?.formula || exponentialFunction?.formula || ''}
          </span>
        </div>

        <div className="instructions">
          <em>Drag the small black circles to move and resize the large white circle.</em>
        </div>

        <div className="instructions">
          <em>{instructions}</em>
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
