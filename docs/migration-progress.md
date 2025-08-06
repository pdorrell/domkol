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

### Stage 2: Interactive Zero Handles ✅
- [x] Coordinate transformation utilities (`src/utils/coordinateTransforms.ts`)
- [x] ComplexNumberHandle component (`src/components/ComplexNumberHandle.tsx`)
- [x] Display draggable zero handles on the complex plane
- [x] Handle drag interactions to update polynomial zeroes
- [x] Real-time formula updates when zeroes are moved
- [x] Blue-colored number labels with semi-transparent background
- [x] Small blue circles indicating precise zero positions

### Stage 3: Domain Circle Visualization ✅
- [x] DomainCircle MobX store (`src/stores/DomainCircle.ts`)
- [x] DomainCircleView component with SVG circle rendering (`src/components/DomainCircleView.tsx`)
- [x] Display domain circle (white circle with 80% opacity)
- [x] DomainHandle component for black circular handles (`src/components/DomainHandle.tsx`)
- [x] Center handle for dragging circle position
- [x] Circumference handle for scaling circle radius
- [x] Real-time circle updates during drag operations

### Stage 4: Coordinate Systems ✅
- [x] CoordinateGrid component with SVG rendering (`src/components/CoordinateGrid.tsx`)
- [x] Polar coordinate grid with concentric circles and radial lines
- [x] Cartesian coordinate grid with axis lines and grid lines
- [x] Grid labels showing coordinate values and angles
- [x] Integrated coordinate grids into main visualization

## In Progress 🚧

Ready for stage 5 of the staged migration plan.

## Remaining Features 📋

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