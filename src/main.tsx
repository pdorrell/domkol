import React from 'react';
import ReactDOM from 'react-dom/client';
import { Domkol } from './models/Domkol';
import { DomkolView } from './DomkolView';

// Create the main Domkol model instance
const domkol = new Domkol();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DomkolView domkol={domkol} />
  </React.StrictMode>,
);
