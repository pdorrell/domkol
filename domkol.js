/** 
    Domkol. 
    
    Complex function visualisation with domain colouring, interactive "domain circle" and dragging of
    polynomial function zeroes.
    
    Copyright (2013) Philip Dorrell (thinkinghard.com)
    
    This application has a "model/view" structure. 
    All references to actual HTML/SVG/Canvas objects are in the view objects.
    Each view has a reference to an associated model, but not the other way round.
    (One current exception: the complex function model has a reference to the main explorer view, 
    in order to propagate updates.)
    In effect the "view" is both the view and the controller.
    
    
    Complex numbers are directly represented as arrays of two reals, i.e. [x,y] represents x+yi
    
    "Units" refers to complex units, like 1 and i
    "Pixels" refers to web-browser pixels (not necessarily the same as screen pixels)
    
    "Complex viewport" refers to the rectangular subset of the complex plane represented by the Canvas element.
    It has pixel coordinates, starting with (0,0) at the top left. It has (complex) unit coordinates, 
    real component increasing to the right, imaginary component increasing upwards. The mapping between the two
    is determined by the origin location in pixel coordinates, and the "pixelsPerUnit" value (which is the same
    in both directions, to enforce an aspect ratio of 1:1).
 */

$(document).ready(function(){
  
  /* From the view, calculate how many draggable function zeroes there are 
     (and therefore how many zeros the polynomial function */
  var numZeroHandles = $('#zero-handles').children(".zero").length;
  
  /* Create an array of repeated [0, 0] (i.e. 0+0i) */
  var zeroes = [];
  for (var i=0; i<numZeroHandles; i++) {
    zeroes.push([0, 0]);
  }
  
  /* The model of the polynomial function */
  var complexFunction = new PolynomialFunction({"zeroes": zeroes});
  
  /* The model of the circular subset of the complex plane */
  var domainCircle = new DomainCircle({circumferenceIncrementInPixels: 1});
  
  /* The main model of the application */
  var explorerModel = new ComplexFunctionExplorerModel({ f: complexFunction.getFunction(), 
                                                         pixelsPerUnit: 240, 
                                                         originPixelLocation: [280, 280], 
                                                         pixelsDimension: [560, 560], 
                                                         colourScale: 1.0,
                                                         domainCircle: domainCircle });
  
  /* The view of the polynomial function (consisting of the draggable handles) */
  var functionView = new PolynomialFunctionView({"zeroHandles": $('#zero-handles'), 
                                                 functionModel: complexFunction, 
                                                 explorerModel: explorerModel});
  
  /* The view of the "domain circle", including two draggable handles, the circle, the polar grid,  
     a checkbox controlling its visibility, and the paths of the real&imaginary values of f on the circle. */
  var domainCircleView = new DomainCircleView({circleGraph: $('#circle-graph'), 
                                               centreHandle: $('#centre-handle'), 
                                               edgeHandle: $('#edge-handle'), 
                                               bigCircle: $("#big-circle"), 
                                               polarGrid: $("#polar-grid"), 
                                               polarGridCoarse: $("#polar-grid-coarse"), 
                                               realPathElement: $("#real-path"), 
                                               imaginaryPathElement: $("#imaginary-path"), 
                                               showCircleGraphCheckbox: $("#show-circle-graph-checkbox"), 
                                               domainCircle: explorerModel.domainCircle});

  /* The view of the coordinates in the complex viewport. There is a grid for integral values, and  
     a finer one for multiples of 0.1 & 0.1i. Integral coordinate values are displayed, and there is 
     a checkbox controlling visibility of the coordinate grid. */
  var coordinatesView = new CoordinatesView({coordinates: $('#coordinates'), 
                                             axes: $('#axes'), 
                                             unitGrid: $('#unit-coordinate-grid'), 
                                             fineGrid: $('#fine-coordinate-grid'), 
                                             showCoordinateGridCheckbox: $("#show-coordinate-grid-checkbox"), 
                                             explorerModel: explorerModel });

  /* The main view of the application containing all its component views and associated models. */
  var explorerView = new ComplexFunctionExplorerView({explorerModel: explorerModel, 
                                                      canvas: $('#domkol-canvas')[0], 
                                                      domainCircleView: domainCircleView, 
                                                      coordinatesView: coordinatesView, 
                                                      scaleSlider: $("#scale-slider"), 
                                                      scaleValueText: $("#scale-value"), 
                                                      colourScaleSlider: $("#colour-scale-slider"), 
                                                      colourScaleText: $("#colour-scale"),
                                                      repaintContinuouslyCheckbox: $("#repaint-continuously-checkbox"), 
                                                      formula: $("#formula"), 
                                                      complexFunction: complexFunction});
  
  /* Make the controls window draggable by it's top bar. */
  $(".controls").draggable({ handle: ".window-top-bar" });
});

/* Function to display a Javascript object as a string (only goes to a depth of one) */ /* Useful for tracing code. */
function objectToString(object, maxValueLength) {
  var result = "{";
  var first = true;
  $.each(object, function(key,value){
    if (first) {
      first = false;
    }
    else {
      result += ", ";
    }
    var valueString = "" + value;
    if (maxValueLength && valueString.length > maxValueLength) {
      valueString = valueString.substring(0, maxValueLength) + " ...";
    }
    result += key + ": " + valueString;
  });
  result += "}";
  return result;
}

/* Regular expression to parse SVG transform attributes like "translate(245 -28)" */
/# Note: allow for "," in between coordinates, even though that should not happen (but Windows Firefox puts it there) */
var translateRegexp = /^translate[(]([-0-9.]+)[, ]+([-0-9.]+)[)]$/;

/* Get the SVG translation from the "transform" attribute of a JQuery element wrapper.
   This is used to implement dragging of SVG elements, which do not consistently respond
   to changes in the "top" and "left" CSS attributes.
   (The assumption is that the element has a simple translate transform attribute, and not anything else.) */
function getTranslation(handle) {
  var transform = handle.attr("transform");
  var translateRegexpMatch = translateRegexp.exec(transform);
  if (translateRegexpMatch == null) {
    throw "Invalid transform attribute (not a simple translate(x y)): " + transform;
  }
  return [parseInt(translateRegexpMatch[1]), parseInt(translateRegexpMatch[2])];
}

/* Set the translation of an SVG element in its "transform" attribute. x and y are pixel values.
   getTranslation and setTranslation are effectively inverses, except getTranslation returns x and y as an array. */
function setTranslation(handle, x, y) {
  handle.attr("transform", "translate(" + x + " " + y + ")");
}  

/* A function which adds "draggable" functionality to SVG elements.
   This function is a work-around for the issue that JQuery UI "draggable" does
   not work with SVG elements.
   Unfortunately this work-around does not work consistently across browsers for "g" (group) elements.
   But it does work for "circle" elements (and probably others as well, but I haven't tried).
   It causes the element to fire its own "startSvgDrag", "svgDrag" and "svgDragStop" events.
   How it works: 
        * it manages the position of the object using the "translate" SVG element "transform" attribute.
        * dragging position is determined from JQuery event.pageX and event.pageY values
        * the offset between the translate value and the pageX/pageY values is stored when dragging starts */
function svgDraggable(handle) {
  var translateRegexp = /^translate[(]([-0-9.]+)[ ]+([-0-9.]+)[)]$/;
  var position = getTranslation(handle); /* test that the transform attribute is set properly */
  handle.draggable()
    .css('cursor', 'move')
    .bind('mousedown', function(event){
      var position = getTranslation(handle);
      var x = position[0];
      var y = position[1];
      handle.data("offset", [x - event.pageX, y - event.pageY]);
      handle.trigger('startSvgDrag', [x, y]);
    })
    .bind('drag', function(event, ui){
      var offset = handle.data("offset");
      var x = event.pageX + offset[0];
      var y = event.pageY + offset[1];
      setTranslation(handle, x, y);
      handle.trigger('svgDrag', [x, y]);
    })
    .bind('dragstop', function(event){
      var position = getTranslation(handle);
      var x = position[0];
      var y = position[1];
      handle.trigger('svgDragStop', [x, y]);
    });
}

/* Create SVG path attribute for an array of points */
function createPointsPath(points) {
  var pointStrings = new Array();
  for (var i=0; i<points.length; i++) {
    /* Reduce point values to 3dp to help reduce path string size
       (sometimes (0.001*x)*1000 is not 3dp due to rounding errors, but that doesn't matter) */
    pointStrings[i] = (0.001*Math.round(points[i][0]*1000) + "," + 
                       0.001*Math.round(points[i][1]*1000));
  }
  pointStrings[0] = "M" + pointStrings[0];
  pointStrings[1] = "L" + pointStrings[1];
  var pathString = pointStrings.join(" ");
  return pathString;
}

/* Create an SVG path element to draw a circle */
function pathCircleComponent(cx, cy, r) {
  return "M" + cx + "," + cy + " " +
    "m " + (-r) + ",0 " + 
    "a " + r + "," + r + " 0 1,0 " + (2*r) + ",0 " +
    "a " + r + "," + r + " 0 1,0 " + (-2*r) + ",0";
}

/* The following functions do calculations on complex numbers represented as 
   arrays of the real and imaginary components, i.e. [x, y] represents x+yi
   (equivalently, z = [re(z), im(z)], re(z) = z[0], im(z) = z[1]). */

/** Subtract second complex number from the first complex number */
function minus(z1, z2) {
  return [z1[0]-z2[0], z1[1]-z2[1]];
}

/** Multiply two complex numbers together */
function times(z1, z2) {
  return [z1[0]*z2[0] - z1[1]*z2[1], 
          z1[0]*z2[1] + z1[1]*z2[0]];
}

/* Set attributes on a Javascript object from an object literal and an array of keys
   This is a convenient method to construct an object from multiple named parameters. */
function setAttributes(object, attributes, keys) {
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    if (attributes.hasOwnProperty(key)) {
      object[key] = attributes[key];
    }
    else {
      throw "Attribute value " + key + " not supplied";
    }
  }
}

/* Model of the domain circle, i.e. a 1-D subset of the domain which is the circumference of 
   the circle, and for which the values of the function f will be displayed as two graphs of
   the real and imaginary values of f going around the circle. */
function DomainCircle(attributes) {
  setAttributes(this, attributes, 
                ["circumferenceIncrementInPixels"]); /* for each increment going around the circumference, calculate
                                                        a new value of f */

  // attributes set by view: centreHandlePosition, edgeHandlePosition, radius
}

DomainCircle.prototype = {

  /** Calculate and store the radius value (in pixels) */
  "calculateRadius": function() {
    var edgeX = this.edgeHandlePosition[0];
    var edgeY = this.edgeHandlePosition[1];
    this.radius = Math.sqrt(edgeX*edgeX + edgeY*edgeY);
  }, 
  
  /* Return real & imaginary of f on the domain circle as arrays of points (in pixel coordinates) */
  "functionGraphPointArrays": function () {
    var explorerModel = this.explorerModel;
    var unitsPerPixel = explorerModel.unitsPerPixel();
    var cx = this.centreHandlePosition[0]; // pixel X coordinate of circle centre
    var cy = this.centreHandlePosition[1]; // pixel X coordinate of circle centre
    var r = this.radius; // radius of circle in pixels
    var angleIncrement = this.circumferenceIncrementInPixels / r; // How often to recalculate f going round the circle
    var numSteps = 2*Math.PI/angleIncrement; // Number of values of f that will be calculated
    var pointsReal = new Array(); // Array of points representing the real components of value of f
    var pointsImaginary = new Array(); // Array of points representing the real components of value of f
    var theta = 0; // Current angular position in circle
    var f = explorerModel.f; // The function
    var minX = explorerModel.minX(); // Minimum x value in complex viewport (in units)
    var minY = explorerModel.minY(); // Minimum y value in complex viewport (in units)
    var heightInPixels = explorerModel.heightInPixels(); // Height of complex viewport in pixels
    var scaleFPixels = explorerModel.scaleF/unitsPerPixel; // How a unit maps to pixels in the displayed f values.
    for (var i=0; i<numSteps+1; i++) {
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var px = cx + r * sinTheta; // re(z) pixel coordinate
      var py = cy + r * cosTheta; // im(z) pixel coordinate
      var x = minX + px * unitsPerPixel; // re(z) unit coordinate
      var y = minY + (heightInPixels - 1 - py) * unitsPerPixel; // im(z) unit coordinate
      var fValue = f([x, y]); // calculated value of f
      var rReal = r + fValue[0] * scaleFPixels; // represented location of re(fValue) in pixels from circle centre
      var rImaginary = r + fValue[1] * scaleFPixels; // represented location of im(fValue) in pixels from circle centre
      pointsReal[i] = [rReal * sinTheta + cx, rReal * cosTheta + cy]; // add pixel coordinate of re(fValue) to real path
      pointsImaginary[i] = [rImaginary * sinTheta + cx, rImaginary * cosTheta + cy]; // add pixel coordinate of im(fValue)
      theta += angleIncrement; // step around to angle of next value to compute
    }
    return {real: pointsReal, imaginary: pointsImaginary};
  }
};

/** The main model of the application */
function ComplexFunctionExplorerModel(attributes) {
  setAttributes(this, attributes, 
                ["f", /** The complex function, satisfying f([re(z),im(z)]) = [re(f(z)),im(f(z))] */
                 "pixelsPerUnit", /** How many pixels make one complex unit? */
                 "originPixelLocation", /** What is the pixel location of the complex origin? */
                 "pixelsDimension", /** pixelsDimension = [width, height], width & height of complex viewport in pixels */
                 "domainCircle", /** An object of class DomainCircle */
                 "colourScale"]);/* multiply re(f) and im(f) values by colourScale to get values 
                                    where values in range -1 to 1.0 are represented by 0 to 255
                                    in the specified RGB components. (currently hardcoded to real=>R, imaginary=>G)*/
  
  // attributes set by view: scaleF
    
  this.domainCircle.explorerModel = this; // link to parent
}

ComplexFunctionExplorerModel.prototype = {
  /** minimum value of X = re(z) in complex viewport */
  "minX": function() { return -(this.originPixelLocation[0]/this.pixelsPerUnit); }, 
  
  /** minimum value of Y = im(z) in complex viewport */
  "minY": function() { return (this.originPixelLocation[1]-this.heightInPixels())/this.pixelsPerUnit; }, 

  /** How much the z value in complex units changes per pixel */
  "unitsPerPixel": function() {return 1.0/this.pixelsPerUnit;}, 
    
  /** Width of complex viewport in pixels */
  "widthInPixels": function() { return this.pixelsDimension[0]; },     
  
  /** Height of complex viewport in pixels */
  "heightInPixels": function() { return this.pixelsDimension[1]; }, 
  
  /** Convert pixel position to a complex number */
  "positionToComplexNumber": function(x, y) {
    return [(x-this.originPixelLocation[0])/this.pixelsPerUnit, 
            (this.originPixelLocation[1]-y)/this.pixelsPerUnit];
  }, 
  
  /** Compute f for every pixel and write the representative colour values
      to the "data" array in the format that can be directly written to HTML canvas element. */
  "writeToCanvasData": function(data) {
    var widthInPixels = this.widthInPixels();
    var heightInPixels = this.heightInPixels();
    var minX = this.minX();
    var minY = this.minY();
    var f = this.f;
    var colourScale = this.colourScale;
    var unitsPerPixel = this.unitsPerPixel();
    
    var x = minX; // start with lowest value of re(z)
    for (var i=0; i<widthInPixels; i++) {
      var y = minY; // start with lowest value of im(z)
      for (var j=heightInPixels-1; j >= 0; j--) { // note - canvas Y coords are upside down, so we start at the bottom
        var z = f([x, y]);
        var k = (j*widthInPixels+i)*4;
        data[k] = (z[0]*colourScale+1.0)*128; // positive real & negative imaginary = red
        data[k+1] = (z[1]*colourScale+1.0)*128; // positive imaginary & negative real = green
        data[k+2] = 0;
        data[k+3] = 255;
        y += unitsPerPixel;
      }
      x += unitsPerPixel;
    }
  }
};
  
/** The view for the circular domain which displays values of f for points on the circle
    as two separate real and imaginary graphs.*/
function DomainCircleView (attributes) {
  setAttributes(this, attributes, 
                ["circleGraph", /** JQuery wrapper for element contain the whole view (for showing/hiding) */
                 "centreHandle", /** JQuery wrapper for centre handle which is a SVG circle */
                 "edgeHandle", /** JQuery wrapper for edge handle which is a SVG circle */
                 "bigCircle", /** JQuery wrapper for SVG circle element representing the subset of the domain*/
                 "polarGrid", /** JQuery wrapper for SVG path representing 
                                  the polar grid (circles & radial axes) */
                 "polarGridCoarse", /** JQuery wrapper for SVG path representing 
                                        the "coarse" part of polar grid, inner&outer radial circles and 
                                        vert&horiz radial axes  */
                 "realPathElement", /** JQuery wrapper for SVG path representing real parts of f on the domain circle */
                 "imaginaryPathElement", /** JQuery wrapper for SVG path representing imaginary parts of f 
                                             on the domain circle */
                 "showCircleGraphCheckbox", /** Checkbox to show or not show the circle domain graph */
                 "domainCircle"]); /** An object of class DomainCircle, the model for this view */
  
  svgDraggable(this.centreHandle); // Make the centre handle (which is an SVG element) draggable
  svgDraggable(this.edgeHandle); // Make the edge handle (which is an SVG element) draggable
  
  /** Set local variable values for access inside inner functions */
  var view = this;
  var domainCircle = this.domainCircle;

  // drag the centre handle to move the domain circle around
  this.centreHandle.on('svgDrag', function(event, x, y) {
    view.bigCircle.attr({cx: x, cy: y}); // Move the centre of the domain circle
    var edgePos = domainCircle.edgeHandlePosition;
    setTranslation(view.edgeHandle, x + edgePos[0], y + edgePos[1]); // Also move the edge handle
    view.updateModel();
    view.drawFunctionOnCircle();
  });
  
  // drag the edge handle to change the radius of the domain circle
  this.edgeHandle.on('svgDrag', function(event, x, y) {
    view.updateModel();
    view.bigCircle.attr('r', domainCircle.radius); // Change the radius of the domain circle
    view.drawFunctionOnCircle();
  });
  
  // check/uncheck checkbox to show/hide the domain circle view
  this.showCircleGraphCheckbox.on("change", function(event) {
    view.circleGraph.toggle(this.checked);
  });
  
  // initial update of model for the initial state of the view
  this.updateModel();
}

DomainCircleView.prototype = {
  /** Update the model from view changes. */
  "updateModel": function() {
    this.domainCircle.centreHandlePosition = getTranslation(this.centreHandle);
    this.domainCircle.edgeHandlePosition = minus(getTranslation(this.edgeHandle), 
                                                 this.domainCircle.centreHandlePosition);
    this.domainCircle.calculateRadius();
  }, 
  
  /** Calculate and draw the real & imaginary paths. Also draw the polar grid. */
  "drawFunctionOnCircle": function() {
    var pointArrays = this.domainCircle.functionGraphPointArrays();
    this.realPath = createPointsPath(pointArrays["real"]);
    this.imaginaryPath = createPointsPath(pointArrays["imaginary"]);
    this.realPathElement.attr("d", this.realPath);
    this.imaginaryPathElement.attr("d", this.imaginaryPath);
    this.drawPolarGrid();
  }, 
  
  /** Draw the polar grid. Circles represent the range of f values from -1.0 to 1.0,
      in steps of 0.1. (When the f values are "scaled" via the slider, the polar grid is resized to match, 
      so the grid is always showing actual f values.) Also shows radial axes every 15 degrees.
      There are two paths, one "coarse" ("coarsePathComponents" showing the more important parts of the grid
      using thicker lines) and one "fine" ("pathComponents" for showing all the grid using thinner lines).
  */
  "drawPolarGrid": function() {
    var theta = 0;
    var numRadialLinesPerQuarter = 6;
    var numRadialLines = numRadialLinesPerQuarter*4;
    var thetaIncrement = Math.PI * 2 / numRadialLines;
    var pathComponents = [];
    var coarsePathComponents = [];
    var pathIndex = 0;
    var coarsePathIndex = 0;
    var centrePos = this.domainCircle.centreHandlePosition;
    var centreX = centrePos[0];
    var centreY = centrePos[1];
    var pixelsPerUnit = this.domainCircle.explorerModel.pixelsPerUnit;
    var pixelsPerScaledUnit = pixelsPerUnit * this.domainCircle.explorerModel.scaleF;
    var gridRadius = this.domainCircle.radius + pixelsPerScaledUnit;
    var innerRadius = this.domainCircle.radius - pixelsPerScaledUnit;
    var innerGridRadius = Math.max(innerRadius, 0);
    // draw the radial axes into the paths
    for (var i = 0; i<numRadialLines; i++) {
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var lineStartX = centreX + innerGridRadius * sinTheta;
      var lineEndX = centreX + gridRadius * sinTheta;
      var lineStartY = centreY + innerGridRadius * cosTheta;
      var lineEndY = centreY + gridRadius * cosTheta;
      var lineComponent = "M" + lineStartX + "," + lineStartY + " " + "L" + lineEndX + "," + lineEndY;
      pathComponents[pathIndex++] = lineComponent;
      if (i%numRadialLinesPerQuarter == 0) {
        coarsePathComponents[coarsePathIndex++] = lineComponent;
      }
      theta += thetaIncrement;
    }
    // draw the circles into the paths
    var stepsPerScaledUnit = 10;
    var radiusStep = pixelsPerScaledUnit / stepsPerScaledUnit;
    for (var i = -stepsPerScaledUnit; i <= stepsPerScaledUnit; i++) {
      var gridCircleRadius = this.domainCircle.radius + i * radiusStep;
      if (gridCircleRadius > 0) {
        var circleComponent = pathCircleComponent (centreX, centreY, gridCircleRadius);
        pathComponents[pathIndex++] = circleComponent;
        if (i%stepsPerScaledUnit == 0) {
          coarsePathComponents[coarsePathIndex++] = circleComponent;
        }
      }
    }
    this.polarGrid.attr("d", pathComponents.join(" "));
    this.polarGridCoarse.attr("d", coarsePathComponents.join(" "));
  }

};

/** The model for a polynomial function of type (z-a)(z-b)(z-c) with zeroes at a,b,c 
    (Of degree 3 in that example, but could be any degree.)*/
function PolynomialFunction(attributes) {
    setAttributes(this, attributes, 
                  ["zeroes"]); /** The array of complex numbers which are the zeroes of the polynomial */
}

PolynomialFunction.prototype = {
    
  /** Retrieve the function f such that f(z) = f([re(z),im(z)]) is the value of the polynomial applied to z */
  "getFunction": function() {
    var zeroes = this.zeroes;
    return function(z) {
      var result = [1, 0];
      for (var i=0; i<zeroes.length; i++) {
        result = times(result, minus(z, zeroes[i]));
      }
      return result;
    };
  }, 
  
  /** Get a displayable formula for the function (with roots displayed to 2DP) */
  "getFormula": function() {
    var formula = "";
    var zeroes = this.zeroes;
    for (var i=0; i<zeroes.length; i++) {
      var zero = zeroes[i];
      formula += ("(" + formatVariablePlusComplexNumber("z", -zero[0], -zero[1], 2) + ")");
    }
    return formula;
  }
    
};

/** The view for the polynomial function, consisting of draggable handles for changing the zeroes of
    the polynomial, and a textual display of the formula for the function.*/
function PolynomialFunctionView(attributes) {
    setAttributes(this, attributes, 
                  ["zeroHandles", /** JQuery wrapper for the HTML div that holds the zero handle elements */
                   "functionModel", /** An object of class PolynomialFunction which is the model for this view */
                   "explorerModel"]); /** Reference to the main model for the application */
    var numZeroes = this.functionModel.zeroes.length;
    var handles = this.zeroHandles.children(".zero");
    if (handles.length != numZeroes) {
        throw "Number of zero handles does not match number of zeroes";
    }
    for (var i=0; i<numZeroes; i++) {
      var handle = handles.eq(numZeroes-1-i);
      this.setupHandle(i, handle);
    }
}

/** Regular expression to parse CSS pixel dimensions such as "35px" or "-45px" */
var pxRegexp = /^([-0-9]+)px$/
  
/** A function to parse an expression like "-45px", and return (for that example) the number -45. */
function fromPx(pxExpression) {
  var pxMatch = pxRegexp.exec(pxExpression);
  if (pxMatch == null) {
    throw "Invalid px expression (expecting '<integer>px'): " + pxExpression;
  }
  return parseInt(pxMatch[1]);
}

PolynomialFunctionView.prototype = {
  
  /** Set the number label on the draggable handle for the ith zero. */
  "setNumberLabel" : function(i, handle) {
    var z = this.functionModel.zeroes[i];
    var formattedZ = formatComplexNumber(z[0], z[1], 2);
    $(handle).children(".zero-text").text(formattedZ);
  },    
  
  /** Initialise the draggable handle for the ith zero. */
  "setupHandle": function(i, handle) {
    var index = i;
    var explorerModel = this.explorerModel;
    var functionModel = this.functionModel;
    var view = this;
    this.setNumberLabel(index, handle[0]);
    var pointCircle = handle.children(".point-circle");
    var pointXOffset = fromPx(pointCircle.css("left")) + fromPx(pointCircle.css("width"))/2;
    var pointYOffset = fromPx(pointCircle.css("top")) + fromPx(pointCircle.css("height"))/2;
    /** When dragged, update the corresponding zero in the function model, and tell the 
        explorer view to redraw & repaint everything that depends on the function. */
    handle.draggable({drag: 
                      function(event, ui) {
                        var x = ui.position.left + pointXOffset;
                        var y = ui.position.top + pointYOffset;
                        var z = explorerModel.positionToComplexNumber(x, y);
                        functionModel.zeroes[index] = z;
                        view.setNumberLabel(index, this);
                        functionModel.explorerView.functionChanging();
                      }, 
                      stop: 
                      function(event, ui) {
                        var x = ui.position.left + pointXOffset;
                        var y = ui.position.top + pointYOffset;
                        var z = explorerModel.positionToComplexNumber(x, y);
                        functionModel.zeroes[index] = z;
                        view.setNumberLabel(index, this);
                        functionModel.explorerView.functionChanged(false);
                      }})
      .css("cursor", "move");
  }
};
    

/** The view representing the coordinates in the complex plane as displayed within the complex viewport */
function CoordinatesView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", /** A reference to the main application model */
                 "showCoordinateGridCheckbox", /** Checkbox controlling visibility of the coordinates */
                 "coordinates", /** JQuery wrapper for the element containing all the coordinate elements */
                 "axes", /** JQuery wrapper for the SVG path representing the real & imaginary axes */
                 "unitGrid", /** JQuery wrapper for the SVG path representing the grid with spacing 1 complex unit */
                 "fineGrid"]); /** JQuery wrapper for the SVG path representing the grid with spacing 0.1 complex units */
  
  /** Note: the SVG text elements for coordinate values are generated dynamically */
  
  this.coordinatesGroup = this.coordinates.children('[class="coordinates-group"]'); /* note: selector ".coordinates-group"
                                                                                       doesn't work on SVG elements */
  
  // put view in local variable for access by event handlers
  var view = this;
  
  /** Toggle the checkbox to show/hide the coordinates */
  this.showCoordinateGridCheckbox.on("change", function(event) {
      view.coordinates.toggle(this.checked);
    });
  
  this.redraw();
}

/** Regex to parse the normal Javascript representation of a float value */
var decimalNumberRegexp = /^(-|)([0-9]*|)([.][0-9]*|)(e[-+]?[0-9]+|)$/

/** Reformat a Javascript number to show no more than specified number of 
    decimal places (but don't trim trailing 0's) */
function reformatToPrecision(numberString, precision) {
  var match = decimalNumberRegexp.exec(numberString);
  var minusSign = match[1];
  var wholeNumber = match[2];
  var decimalPart = match[3].substring(0, precision+1);
  var exponentPart = match[4]; /* todo: round down to zero if too small */
  return minusSign + wholeNumber + decimalPart + exponentPart;
}

/** Format a complex number to specified precision, using standard notation */
function formatComplexNumber(x, y, precision) {
  var showX = x != 0 || y == 0;
  var xString = showX ? reformatToPrecision(""+x, precision) : "";
  var showY = y != 1 & y != 0;
  var yString = y == -1 ? "-" : (showY ? reformatToPrecision(""+y, precision) : "");
  var showI = y != 0;
  var showPlus = x != 0 && y > 0 && showI;
  return xString + (showPlus ? "+" : "") + yString + (showI?"i" : "");
}

/** Format a complex number added to a variable. e.g. for "z" and 0-3.0233i, and precision 3 show "z-3.023i" */
function formatVariablePlusComplexNumber(variableName, x, y, precision) {
  if (x == 0 && y == 0) {
    return variableName;
  }
  else {
    var showPlus = x > 0 || (x == 0 && y > 0);
    return variableName + (showPlus ? "+" : "") + formatComplexNumber(x, y, precision);
  }
}

/* JQuery cannot construct SVG elements the same way as it does HTML elements, but
   the following function does the trick.
   Taken from http://stackoverflow.com/questions/7261318/svg-chart-generation-in-javascript#answer-15582018
 */
function makeSvgElement(tag, attributes) {
  var svgElement= document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var key in attributes)
    svgElement.setAttribute(key, attributes[key]);
  return svgElement;
}

CoordinatesView.prototype = {
  
  "xCoordinateOffset": 3, // amount to offset (rightwards) the bottom left corner of coordinate value from actual location
  "yCoordinateOffset": 3, // amount to offset (upwards) the bottom left corner of coordinate value from actual location
  
  /** Add an SVG coordinate text element for a coordinate location with bottom left corner at pixel location x,y */
  "addCoordinatesText" : function(text, x, y) {
    var textElement = makeSvgElement("text", {class: "coordinates", x: x, y: y, fill: "#d0d0ff"})
    var textNode = document.createTextNode(text);
    textElement.appendChild(textNode);
    this.coordinatesGroup.append(textElement);
  }, 
  
  /** Return SVG path component for a horizontal axis for y = im(z). */
  "horizontalPath": function (y) {
    var maxX = this.explorerModel.pixelsDimension[0];
    var yPixels = this.explorerModel.originPixelLocation[1] + this.explorerModel.pixelsPerUnit * y;
    return "M0," + yPixels + " L" + maxX + "," + yPixels;
  }, 
  
  /** Return SVG path component for a vertical axis for x = re(z). */
  "verticalPath": function (x) {
    var maxY = this.explorerModel.pixelsDimension[1];
    var xPixels = this.explorerModel.originPixelLocation[0] + this.explorerModel.pixelsPerUnit * x;
    return "M" + xPixels + ",0 L" + xPixels + "," + maxY;
  }, 
  
  /** Draw the coordinate grid with specified spacing (in complex units) into the SVG path component */
  "drawGrid": function(gridPathElement, spacing, showCoordinateLabels) {
    var origin = this.explorerModel.originPixelLocation;
    var dimension = this.explorerModel.pixelsDimension;
    var pixelsPerUnit = this.explorerModel.pixelsPerUnit;
    
    // draw the vertical grid lines
    var minXIndex = Math.ceil((0-origin[0])/(pixelsPerUnit*spacing));
    var maxXIndex = Math.floor((dimension[0]-origin[0])/(pixelsPerUnit*spacing));
    var pathComponents = [];
    var componentsIndex = 0;
    for (var i=minXIndex; i <= maxXIndex; i++) {
      pathComponents[componentsIndex++] = this.verticalPath(i*spacing);
    }
    // draw the horizontal grid lines, and, if required, add the coordinate labels
    var xCoordinateOffset = this.xCoordinateOffset;
    var yCoordinateOffset = this.yCoordinateOffset;
    if (showCoordinateLabels) {
      this.coordinatesGroup.empty();
    }
    var minYIndex = Math.ceil((origin[1]-dimension[1])/(pixelsPerUnit*spacing));
    var maxYIndex = Math.floor(origin[1]/(pixelsPerUnit*spacing));
    for (var i=minYIndex; i <= maxYIndex; i++) {
      pathComponents[componentsIndex++] = this.horizontalPath(i*spacing);
      var yCoordinatePos = origin[1] + i*spacing*pixelsPerUnit - yCoordinateOffset;
      if (showCoordinateLabels) {
        // add all the coordinate labels along this horizontal grid line
        for (var j = minXIndex; j <= maxXIndex; j++) {
          var xCoordinatePos = origin[0] + j*spacing*pixelsPerUnit + xCoordinateOffset;
          this.addCoordinatesText(formatComplexNumber(j*spacing, -i*spacing, 2), xCoordinatePos, yCoordinatePos);
        }
      }
    }
    gridPathElement.attr("d", pathComponents.join(" "));
  }, 
  
  /** redraw the grid and coordinate labels into the relevant SVG elements */
  "redraw": function() {
    var origin = this.explorerModel.originPixelLocation;
    var dimension = this.explorerModel.pixelsDimension;
    this.axes.attr("d", this.horizontalPath(0) + " " + this.verticalPath(0));
    
    this.drawGrid(this.unitGrid, 1.0, true);
    this.drawGrid(this.fineGrid, 0.1, false);
  }
};
  
/** The main view for the application */
function ComplexFunctionExplorerView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", /** The model for this view */
                 "canvas", /** JQuery wrapper for the canvas element, onto which the domain colouring is painted */
                 "domainCircleView", /** Object of class DomainCircleView, being the domain circle view*/
                 "coordinatesView", /** Object of class CoordinatesView, being the coordinates view */
                 "scaleSlider", /** JQuery wrapper for the slider that sets the function scale in the domain circle */
                 "scaleValueText", /** JQuery wrapper for display of function scale value */
                 "colourScaleSlider", /** JQuery wrapper for the slider that sets the 
                                          colour scale (of the domain colouring) */
                 "colourScaleText", /** JQuery wrapper for display of colour scale */
                 "complexFunction", /** Object of class PolynomialClass (or other object with a similar interface), 
                                        being the model of the complex function being visualised*/
                 "formula", /** JQuery wrapper for display of the formula for the complex function */
                 "repaintContinuouslyCheckbox"]); /** JQuery wrapper for checkbox that controls continuous repainting */
  this.complexFunction.explorerView = this;
  var view = this;

  /** The scale for displaying f on the domain circle is changing (but hasn't finished changing) */
  function scaleChanging(event, ui) {
    view.fScaleUpdated(ui.value); // todo : maybe have option to update when it's changing ?
  }
  
  /** The scale for displaying f on the domain circle has changed */
  function scaleChanged(event, ui) {
    view.fScaleUpdated(ui.value);
  }
  
  this.scaleSlider.slider({"min": 0, "max": 100, "value": 50, 
        "orientation": "horizontal", 
                           "slide": scaleChanging, 
                           "change": scaleChanged
                          });
  
  /** The colour scale has changed */
  function colourScaleChanged(event, ui) {
    view.colourScaleUpdated(ui.value, false);
  }
  
  /** The colour scale is changing (but hasn't finished changing, so maybe don't redraw the domain colouring yet) */
  function colourScaleChanging(event, ui) {
    view.colourScaleUpdated(ui.value, true);
  }
  
  this.colourScaleSlider.slider({"min": 0, "max": 100, "value": 50,
                                 "orientation": "horizontal", 
                                 "slide": colourScaleChanging, 
                                 "change": colourScaleChanged});
  
  /** set initial function scale from slider */
  this.setScaleFFromView(this.scaleSlider.slider("value"));
  
  /** set initial colour scale from slider */
  this.setColourScaleFromView(this.colourScaleSlider.slider("value"));
  
  /** When "repaint continously" checkbox is checked, repaint continuously */
  this.repaintContinuouslyCheckbox.on("change", function(event) {
    view.repaintContinuously = this.checked;
  });
  this.repaintContinuously = this.repaintContinuouslyCheckbox.is(":checked");

  this.functionChanged(false); // force initial repaint
}

ComplexFunctionExplorerView.prototype = {
  
  /** The function scale has been updated, so update the value in the model and 
      redraw the function graph on the domain circle */
  "fScaleUpdated": function(value) {
    this.setScaleFFromView(value);
    this.drawFunctionGraphs();
  }, 
  
  /** The colour scale has been updated (but may not have finished changing),
      update the value in the model and optionally repaint the domain colouring. */
  "colourScaleUpdated": function(value, changing) {
    this.setColourScaleFromView(value);
    this.drawDomainColouring(changing);
  }, 
  
  /** The function has changed (e.g. from dragging the zeroes around), and may or may not
      have finished changing. Update the displayed formular, optionally repaint the domain 
      colouring, and redraw the function graph on the domain circle.*/
  "functionChanged": function(changing) {
    this.formula.text(this.complexFunction.getFormula());
    this.drawDomainColouring(changing);
    this.drawFunctionGraphs(changing);
  },    
  
  /** The function is changing, but has not yet finished changing. */
  "functionChanging": function() {
    this.functionChanged(true);
  }, 
  
  /** Set the function scale (for displaying the domain circle graph) in the model 
      according to a logarithmic scale on the slider. Update the displayed scale value. */
  "setScaleFFromView": function(value) {
    this.explorerModel.scaleF = 0.5 * Math.pow(1.08, value-50);
    this.scaleValueText.text(Math.round(this.explorerModel.scaleF*100)/100.0);
  }, 
  
  /** Set the colour scale (for displaying the domain circle graph) in the model 
      according to a logarithmic scale on the slider. Update the displayed scale value. */
  "setColourScaleFromView": function(value) {
    this.explorerModel.colourScale = 1.0 * Math.pow(1.2, value-50);
    this.colourScaleText.text(Math.round(this.explorerModel.colourScale*100)/100.0);
  }, 

  /** Draw all function graphs (of which there is only one currently - the function graph on the domain circle) */
  "drawFunctionGraphs": function() {
    this.domainCircleView.drawFunctionOnCircle();
  }, 
  
  /** repaint the domain colouring into the canvas element */
  "drawDomainColouring" : function(changing) {
    if (!changing || this.repaintContinuously) {
      var ctx = this.canvas.getContext("2d");
      var imageData = ctx.createImageData(this.explorerModel.widthInPixels(), 
                                          this.explorerModel.heightInPixels());
      this.explorerModel.writeToCanvasData(imageData.data);
      ctx.putImageData(imageData, 0, 0);
    }
  }
    
}
