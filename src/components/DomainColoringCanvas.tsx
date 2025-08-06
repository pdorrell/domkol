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
  const drawDomainColoring = useCallback((overrideChanging?: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const currentlyChanging = overrideChanging !== undefined ? overrideChanging : (changing || false);
    
    if (!currentlyChanging || repaintContinuously) {
      const imageData = context.createImageData(viewport.width, viewport.height);
      writeToCanvasData(imageData.data);
      context.putImageData(imageData, 0, 0);
    }
  }, [writeToCanvasData, repaintContinuously, changing, viewport.width, viewport.height]);
  
  // Handle polynomial function changes with proper change tracking
  const [isChanging, setIsChanging] = React.useState(false);
  
  // Create a dependency array that includes all the zeros to trigger on any change
  const zeroesHash = React.useMemo(() => {
    return polynomialFunction.zeroes.map(z => `${z[0]},${z[1]}`).join('|');
  }, [polynomialFunction.zeroes]);
  
  useEffect(() => {
    // Track if we're in a changing state
    let changeTimeout: number;
    
    const handleChange = () => {
      setIsChanging(true);
      
      // Clear existing timeout
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }
      
      // Set timeout to mark as not changing after a delay
      changeTimeout = setTimeout(() => {
        setIsChanging(false);
        // Redraw once more when changing stops (to ensure final quality render)
        drawDomainColoring(false);
      }, 100);
      
      // Immediate redraw with changing state
      drawDomainColoring(true);
    };
    
    handleChange();
    
    return () => {
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }
    };
  }, [zeroesHash, colorScale, changing, drawDomainColoring]);
  
  // Initial draw
  useEffect(() => {
    drawDomainColoring(false);
  }, [drawDomainColoring]);
  
  // Respond to external changing state
  useEffect(() => {
    if (changing !== undefined) {
      drawDomainColoring(changing);
    }
  }, [changing, drawDomainColoring]);
  
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