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

## Staged Migration Plan

I think a good plan to do the migration would be to reproduce the new MobX/functional React application
one feature at a time.

