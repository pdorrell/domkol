import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ComplexFunction } from '@/stores/ComplexFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import { useDraggable } from '@/hooks/useDraggable';
import './ControlDialog.scss';

interface ControlDialogProps {
  complexFunction?: ComplexFunction | null;
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  domainColoringRenderer: DomainColoringRenderer;
  instructions: string;
}

const ControlDialog = observer(({
  complexFunction,
  domainCircle: _domainCircle,
  functionGraphRenderer,
  domainColoringRenderer,
  instructions
}: ControlDialogProps) => {
  // Calculate initial position based on original CSS values
  // CSS had: top: calc(5% + 20px) and left: calc(540px - 31em * 0.25)
  // Assuming 1em = 16px, 31em = 496px, so 31em * 0.25 = 124px
  const [initialPosition, setInitialPosition] = useState({
    x: 540 - 124, // 416px
    y: window.innerHeight * 0.05 + 20
  });
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const { elementRef: dialogRef, currentValue: position, handlePointerDown } = useDraggable<{x: number, y: number}>({
    initialValue: initialPosition,
    shouldStartDrag: (event) => {
      // Only start dragging if clicking on the drag handle
      return (event.target as HTMLElement).classList.contains('drag-handle');
    },
    onDragEnd: (finalPosition) => {
      // Update the initial position so it doesn't jump back
      setInitialPosition(finalPosition);
    },
    calculateDragOffset: (event, rect, currentPosition) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      return {
        offsetX: clientX - currentPosition.x,
        offsetY: clientY - currentPosition.y
      };
    },
    calculateNewPosition: (clientX, clientY, dragOffset) => {
      return {
        x: clientX - dragOffset.offsetX,
        y: clientY - dragOffset.offsetY
      };
    }
  });


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
    <div
      ref={dialogRef as React.RefObject<HTMLDivElement>}
      className="control-dialog"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div ref={dragHandleRef} className="drag-handle"></div>

      <div className="controls">
        <div className="control-line">
          <span className="function-label">Function</span>
          <span className="function-formula">
            {complexFunction?.formula || ''}
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

export { ControlDialog };
