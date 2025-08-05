# Migration Plan

## Exising ("old") Domkol application

**domkol** is a Javascript web application that displays the values of a 
complex function from ℂ => ℂ on a domain circle around the origin by displaying
values of the function on the circle as a graph where the function's value
is represented in polar coordinates on a plane perpendicular to the circumference
of the circle at that point. The function's value is also represented by 
a colour coding over the full domain plane.

It can include the ability to parametrise the function by one or more 
complex values which can be dragged by the user to change those values.

The default example is a cubic polynomial that is defined by the values
of its three zeroes.

The UI has three main components:

* The function display on a plane representing the domain ℂ of the function **f**.
* A dialog that allows the user to control aspects of the display
* A separate information box explaining performance aspects of the application.
  (That explanation is probably less relevant now than it was 12 years ago when I wrote
  this application).

The application can be run directly by loading a URL for the file `old/main.html` in
any modern web browser.

There is also a menu that allows the user to choose different types of functions - currently
this works by loading a different HTML file URL for each type of function.

### Function display

The main function display has five main display components and two or more draggable controls:

* A cartesian coordinate grid for the domain plane with grid lines and coordinate values
* The domain circle displayed as a white circle
* A polar coordinate grid that shows the scale of the graph of the values of **f** on the 
  domain circle.
* Wiggle-animated graph of the values of **f** on the domain circle.
* The colour encoding of the value of **f** on the domain plane. The colour encoding 
  function is based on a mixture of red and green, there the red component increases
  from 0 to 255 as the real component increases and the green component increases
  from 0 to 255 as the imaginary component increases. This results in the brightest
  yellow in the direction of 1+i, and the darkest black in the direction of -1-i.

The default presentation of the graph on the domain circle includes a representation
of the height of the values above the plane of the screen as follows:

* A "wiggle" animation which moves left and right as a function of distance from the user
  to provide an illusion of 3D.
* The graph is blue when it is above the domain plane, and reduced hue when it is below.
* Parts of the graph above the domain plane cast two faint shadows on the plane.

The presentation of the graph can be altered by the control dialog (which see).

#### Draggable Controls on the Function Display

There are two draggable controls to alter the location of the domain circle (which 
defaults to being the unit circle):

* The centre of the circle, which when dragged moves the circle without changing 
  its radius
* A point on the circumference of the circle which when dragged changes the radius
  of the circle.
  
For polynomial functions there are controls representing the location of each 
zero of the polynomial.

When the user drags a zero around, they will see corresponding changes in the 
colour encoding of the values of **f** and in the shape and location of the 
graph of **f** on the domain circle.

### The Control Dialog

The Control Dialog is a dialog that floats above and partly to the side of the
main function display. It is partly transparent.

It contains the following displays and controls:

* Drag handle bar for the dialog
* A display of the function as a function of a complex variable **z**
* An explanation of the drag controls
* Graph scale: a slider from 0 to 1.0 that adjusts the scale of the distance
  of the graph point f(z) from the domain point z for each point z on the circle.
* Colour scale: a slider from 0 to 1.0 that adjusts the intensity of the colour
  encoding. (At full intensity all the colours max out to be one of black, green,
  red or yellow.)
* Show graph on circular domain checkbox - if unchecked, don't show the domain
  circle or the graph
* Show graph on circular domain in 3D checkbox - if unchecked, show the graph
  as two separate graphs for the real and imaginary parts of f(z), using
  distance from the circle to represent the value (and not using depth).
* 3D Wiggle animation checkbox - whether or not to do the 3D wiggle
* Rotate **f** values - rotates the graph around the circle
* Show domain coordinate grid: checkbox
* Repaint domain colouring continuously: if unchecked, any change from a drag
  or slide interaction only triggers a repaint of the domain colouring 
  when the interaction completes.
* An explanation of the "c" keyboard shortcut for the sliders and the dialog drag handle.

## Migration Plan

The source code for the existing application has been moved to the `old` sub-directory.

The existing application is implemented as a model/view application in Javascript, using
jquery events as a way of managing view updates that have to happen with model values
are changed.

I want to migrate the application to use the following stack:

* Fully type-checked Typescript
* MobX for model classes
* Functional React components for the views
* A modern Javascript local web development setup, using Vite & esbuild

I have added some initial configuration and script files copied from an 
existing Typescript/MobX/React application which should be a good starting
point for setting up this application.

## Existing application

The old application consists mostly of model and view classes which should correspond
directly to MobX model classes (or "stores") and React functional components.

### Model classes

* ComplexFunctionExplorerModel
* DomainCircle
* ComplexFunction
* PolynomialFunction

### View functions & classes

* ControlDialog
* ExplorerViewElements
* DomainCircleView
* CoordinatesView
* ComplexNumberHandle
* ComplexFunctionExplorerView


All of the "connect" and "notify" functions should be replaced by use of MobX observables and observers.

Where 'setAttributes' or 'setJQueryWrappedAttributes' are called on view classes, these 
will correspond to props for React functional components. However where attributes are view objects 
themselves, these should instead be child elements of the view class virtual dom as rendered.

(Note that there will be no use of jquery in the new application.)

Where view classes take explorerViewElements as a first argument, this is not needed in 
the React application, because explorerViewElements is a handle to predefined HTML DOM elements,
whereas with React all DOM elements are generated from the React functions (and situated in
the DOM using root.render taking the top-level virtual DOM element as it's parameter).

Where existing view classes take model objects as attributes, this should directly translate to 
passing MobX models as props to the corresponding React view function.

Many of the individual methods on the view classes would be defined as separate function React
components in the new application.

In the new MobX application, each view function should take as props any model objects that are
relevant to rendering that view. When necessary model objects should have links to their parents.
(That is, don't set up the application to access the main model as a global object - it is preferable
to maintain locality of reference as much as possible.)

## Staged Migration Plan

I think a good plan to do the migration would be to reproduce the new MobX/functional React application
one feature at a time.

Start with the page where the function is a cubic polynomial.

Defining the migration in terms of visible view components, add these features
to the new application one at a time:

* Control dialog, showing the function as the product of three factors.
* Display draggable zero handles (so the displayed function will update when these are dragged around)
* Display domain circle.
* Add center handle to domain circle for dragging around
* Add handle on the circle for scaling the circle
* Add polar coordinate grid
* Add graph not in 3D (ie two separate graphs), add "Show graph on circular domain" to control dialog
* Add 3D SVG graph, and add "Show graph on circular domain in 3D" checkbox to control dialog
* Add 3D wiggle animation, and the control dialog checkbox to enable that
* Add shadows to 3D SVG graph
* Add cartesian coordinates and grid
* Add canvas colour encoded representation of values of the function on the complex plane
* In the control dialog add:
  * Graph scale control
  * Colour scale control
  * Rotate f values
  * Repaint domain colouring continuously

## Appendix: Migration Plan Analysis

### Current State Assessment

**Old Application (jQuery + vanilla JS):**
- Complex mathematical visualization app for domain coloring of complex functions
- Model/View architecture with jQuery events for updates
- Key models: `ComplexFunctionExplorerModel`, `DomainCircle`, `ComplexFunction`, `PolynomialFunction`
- Key views: `ControlDialog`, `DomainCircleView`, `CoordinatesView`, `ComplexNumberHandle`, `ComplexFunctionExplorerView`
- Supports interactive dragging, 3D visualization, color-coded domain representation

**New Application Setup:**
- Modern build system configured (Vite + esbuild)
- TypeScript with strict checking enabled
- React + MobX architecture planned
- No source code implemented yet (`src/` directory doesn't exist)

### Migration Plan Strengths

1. **Well-structured approach** - Staged migration starting with cubic polynomial
2. **Clear architectural mapping** - Models → MobX stores, Views → React components
3. **Feature-by-feature progression** - Logical dependency order from control dialog to full visualization
4. **Preservation of functionality** - All interactive features planned for migration

### Potential Challenges

1. **Canvas rendering complexity** - The domain coloring uses intensive pixel-by-pixel canvas operations that may need optimization
2. **SVG 3D effects** - Complex 3D wiggle animations and shadows will need careful React/SVG integration
3. **Performance** - Real-time updates during dragging operations require efficient MobX observables
4. **Complex coordinate transformations** - Pixel ↔ complex number conversions need careful handling

### Implementation Recommendations

1. **Add missing infrastructure:**
   - Create `package.json` with React, MobX, and math dependencies
   - Set up basic project structure with `src/` directory
   - Add development scripts and linting

2. **Start with core mathematical models:**
   - Implement complex number utilities first
   - Create MobX stores for `ComplexFunction` and `PolynomialFunction`
   - Add coordinate transformation utilities

3. **Consider performance optimizations:**
   - Use `requestAnimationFrame` for smooth animations
   - Implement canvas rendering with `useCallback` and `useMemo`
   - Consider Web Workers for intensive calculations

4. **Plan state management carefully:**
   - Design MobX observable structure to minimize re-renders
   - Use computed values for derived calculations
   - Implement proper reaction cleanup

### Overall Assessment

The migration plan is solid and well-thought-out. The staged approach starting with the control dialog and building up to the full visualization is practical and should result in a maintainable modern application.
