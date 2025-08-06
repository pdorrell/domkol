import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { Complex } from '@/utils/complex';
import './DomainColoringCanvas.css';

interface DomainColoringCanvasProps {
  polynomialFunction: PolynomialFunction;
  viewport: ViewportConfig;
  colorScale: number;
  repaintContinuously: boolean;
  changing?: boolean;
}

const DomainColoringCanvas = observer(({
  polynomialFunction,
  viewport,
  colorScale,
  repaintContinuously,
  changing = false
}: DomainColoringCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Translated from original writeToCanvasData function
  const writeToCanvasData = useCallback((data: Uint8ClampedArray) => {
    const widthInPixels = viewport.width;
    const heightInPixels = viewport.height;
    
    // Calculate complex plane bounds (translated from original logic)
    const [originX, originY] = viewport.originPixelLocation;
    const pixelsPerUnit = viewport.pixelsPerUnit;
    const unitsPerPixel = 1.0 / pixelsPerUnit;
    
    const minX = -(originX / pixelsPerUnit);
    const minY = (originY - heightInPixels) / pixelsPerUnit;
    
    let x = minX; // start with lowest value of re(z)
    
    for (let i = 0; i < widthInPixels; i++) {
      let y = minY; // start with lowest value of im(z)
      
      // Note - canvas Y coords are upside down, so we start at the bottom
      for (let j = heightInPixels - 1; j >= 0; j--) {
        const z: Complex = [x, y];
        const fValue = polynomialFunction.evaluate(z);
        
        const k = (j * widthInPixels + i) * 4;
        
        // Original color encoding algorithm:
        // positive real & negative imaginary = red
        data[k] = (fValue[0] * colorScale + 1.0) * 128;
        // positive imaginary & negative real = green  
        data[k + 1] = (fValue[1] * colorScale + 1.0) * 128;
        data[k + 2] = 0; // blue channel unused
        data[k + 3] = 200; // semi-transparent alpha
        
        y += unitsPerPixel;
      }
      x += unitsPerPixel;
    }
  }, [polynomialFunction, viewport, colorScale]);
  
  // Translated from original drawDomainColouring function
  const drawDomainColoring = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Original logic: if repaintContinuously is true, always repaint (even while changing)
    // If repaintContinuously is false, only repaint when not changing
    if (repaintContinuously || !changing) {
      const imageData = context.createImageData(viewport.width, viewport.height);
      writeToCanvasData(imageData.data);
      context.putImageData(imageData, 0, 0);
    }
  }, [writeToCanvasData, repaintContinuously, changing, viewport.width, viewport.height]);
  
  // Simple dependency tracking - redraw when anything changes
  const zeroesHash = React.useMemo(() => {
    return polynomialFunction.zeroes.map(z => `${z[0]},${z[1]}`).join('|');
  }, [polynomialFunction.zeroes]);
  
  // Single effect that handles all redraws - matches original behavior
  useEffect(() => {
    drawDomainColoring();
  }, [zeroesHash, colorScale, repaintContinuously, changing, drawDomainColoring]);
  
  return (
    <canvas
      ref={canvasRef}
      width={viewport.width}
      height={viewport.height}
      className="domain-coloring-canvas"
    />
  );
});

export default DomainColoringCanvas;