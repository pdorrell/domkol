import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { Complex, complex } from '@/utils/complex';
import { createDefaultViewport } from '@/utils/coordinateTransforms';
import ControlDialog from '@/components/ControlDialog';
import ComplexNumberHandle from '@/components/ComplexNumberHandle';
import DomainCircleView from '@/components/DomainCircleView';
import CoordinateGrid from '@/components/CoordinateGrid';
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
    new DomainCircle(complex(0, 0), 1) // Center at origin, radius 1
  );

  // Create viewport configuration for the complex plane (match CSS dimensions)
  const viewport = React.useMemo(() => createDefaultViewport(560, 560), []);

  // Handle changes to zero positions
  const handleZeroChange = React.useCallback((index: number, newValue: Complex, changing: boolean) => {
    polynomialFunction.updateZero(index, newValue, changing);
  }, [polynomialFunction]);

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
            <svg width={560} height={560} style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Cartesian coordinate grid only - polar grid is part of domain circle */}
              <CoordinateGrid
                viewport={viewport}
                showPolar={false}
                showCartesian={true}
              />
            </svg>
            
            {/* Domain circle with draggable center and radius handles */}
            <DomainCircleView
              domainCircle={domainCircle}
              viewport={viewport}
            />
            
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
          />
        </div>
      </main>
    </div>
  );
});

export default App;