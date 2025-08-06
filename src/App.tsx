import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { complex } from '@/utils/complex';
import ControlDialog from '@/components/ControlDialog';
import './App.css';

const App = observer(() => {
  const [polynomialFunction] = React.useState(() => 
    new PolynomialFunction([
      complex(0, 0),
      complex(0, 0), 
      complex(0, 0)
    ])
  );

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
            {/* Complex plane visualization will go here */}
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