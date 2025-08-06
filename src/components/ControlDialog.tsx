import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import './ControlDialog.css';

interface ControlDialogProps {
  polynomialFunction: PolynomialFunction;
}

const ControlDialog = observer(({ polynomialFunction }: ControlDialogProps) => {
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
      </div>
    </div>
  );
});

export default ControlDialog;