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
  const imageDataRef = useRef<ImageData | null>(null);
  
  // Translated from original writeToCanvasData function - moved outside useCallback to avoid closure overhead
  const writeToCanvasData = (data: Uint8ClampedArray, zeroes: any[], colorScale: number, viewport: ViewportConfig) => {
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
        // Inline polynomial evaluation to match old code performance
        let result = [1, 0];
        for (let k = 0; k < zeroes.length; k++) {
          const zero = zeroes[k];
          const factorReal = x - zero[0];
          const factorImag = y - zero[1];
          // Inline complex multiplication: result = result * (z - zero)
          const newReal = result[0] * factorReal - result[1] * factorImag;
          const newImag = result[0] * factorImag + result[1] * factorReal;
          result[0] = newReal;
          result[1] = newImag;
        }
        
        const pixelIndex = (j * widthInPixels + i) * 4;
        
        // Original color encoding algorithm:
        // positive real & negative imaginary = red
        data[pixelIndex] = (result[0] * colorScale + 1.0) * 128;
        // positive imaginary & negative real = green  
        data[pixelIndex + 1] = (result[1] * colorScale + 1.0) * 128;
        data[pixelIndex + 2] = 0; // blue channel unused
        data[pixelIndex + 3] = 200; // semi-transparent alpha
        
        y += unitsPerPixel;
      }
      x += unitsPerPixel;
    }
  };
  
  // Translated from original drawDomainColouring function
  const drawDomainColoring = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Original logic: if repaintContinuously is true, always repaint (even while changing)
    // If repaintContinuously is false, only repaint when not changing
    if (repaintContinuously || !changing) {
      const startTime = performance.now();
      
      // Reuse ImageData like the old code does
      if (!imageDataRef.current || 
          imageDataRef.current.width !== viewport.width || 
          imageDataRef.current.height !== viewport.height) {
        imageDataRef.current = context.createImageData(viewport.width, viewport.height);
      }
      
      // Cache formula to avoid MobX overhead during logging
      const formula = polynomialFunction.formula;
      console.log(`Domain Colouring: START f=${formula} cs=${colorScale}`);
      
      writeToCanvasData(imageDataRef.current.data, polynomialFunction.zeroes, colorScale, viewport);
      context.putImageData(imageDataRef.current, 0, 0);
      
      const endTime = performance.now();
      console.log(`  END Domain Colouring: ${(endTime - startTime).toFixed(2)}ms`);
    }
  }, [repaintContinuously, changing, viewport, colorScale, polynomialFunction.zeroes, polynomialFunction.formula]);
  
  // MobX will automatically trigger re-renders when observables change
  // Just redraw whenever any dependencies change
  useEffect(() => {
    drawDomainColoring();
  }, [drawDomainColoring]);
  
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