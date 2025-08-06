# Migration Progress

This document tracks the progress of migrating the Domkol complex function visualization application from jQuery/vanilla JavaScript to TypeScript/React/MobX.

## Completed Features ✅

### Infrastructure & Setup
- [x] Modern build system (Vite + esbuild)
- [x] TypeScript configuration with strict checking
- [x] React + MobX architecture setup
- [x] Project structure with `src/` directory
- [x] Complex number utilities (`src/utils/complex.ts`)
- [x] MobX store for PolynomialFunction (`src/stores/PolynomialFunction.ts`)

### Core Application
- [x] Basic App component with header and layout (`src/App.tsx`)
- [x] Control dialog displaying polynomial formula (`src/components/ControlDialog.tsx`)
- [x] Function formula display showing product of factors (e.g., "z × z × z" for zeroes at origin)

## In Progress 🚧

Currently at stage 1 of the staged migration plan.

## Remaining Features 📋

### Stage 2: Interactive Zero Handles
- [ ] Display draggable zero handles on the complex plane
- [ ] Handle drag interactions to update polynomial zeroes
- [ ] Real-time formula updates when zeroes are moved

### Stage 3: Domain Circle Visualization
- [ ] Display domain circle (white circle)
- [ ] Center handle for dragging circle position
- [ ] Circumference handle for scaling circle radius

### Stage 4: Coordinate Systems
- [ ] Polar coordinate grid
- [ ] Cartesian coordinate grid with labels

### Stage 5: Function Graph Visualization
- [ ] 2D graph representation (separate real/imaginary)
- [ ] "Show graph on circular domain" control
- [ ] 3D SVG graph with depth visualization
- [ ] "Show graph on circular domain in 3D" control
- [ ] 3D wiggle animation
- [ ] Shadow effects for 3D graph

### Stage 6: Domain Coloring
- [ ] Canvas-based color encoding of function values
- [ ] Red/green color scheme for real/imaginary components

### Stage 7: Advanced Controls
- [ ] Graph scale slider (0 to 1.0)
- [ ] Colour scale slider (0 to 1.0) 
- [ ] Rotate f values control
- [ ] Show domain coordinate grid checkbox
- [ ] Repaint domain colouring continuously checkbox
- [ ] Dialog dragging functionality

### Stage 8: Polish & Performance
- [ ] Keyboard shortcuts (e.g., "c" shortcut)
- [ ] Performance optimizations for real-time updates
- [ ] Smooth animations and transitions

## Notes

- All zeroes currently initialized at origin (0, 0)
- Empty visualization area ready for complex plane rendering
- Control dialog displays but is not yet draggable