/** 
    This file is part of Domkol.

    Domkol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Domkol is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Domkol.  If not, see <http://www.gnu.org/licenses/>.

    Domkol
    ====== 
    
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
  
  var controlDialog = new ControlDialog({div: $("#control-dialog"), 
                                         wiggleCheckbox: $("#wiggle-checkbox"), 
                                         showCircleGraphCheckbox: $("#show-circle-graph-checkbox"),
                                         show3DGraphCheckbox: $("#show-3d-graph-checkbox"),
                                         rotateGraphSlider: $("#rotate-graph-slider"),
                                         graphRotationText: $("#graph-rotation-text"),
                                         showCoordinateGridCheckbox: $("#show-coordinate-grid-checkbox"),
                                         functionScaleSlider: $("#function-scale-slider"),
                                         colourScaleSlider: $("#colour-scale-slider"),
                                         repaintContinuouslyCheckbox: $("#repaint-continuously-checkbox"),
                                         formulaText: $("#formula-text"),
                                         functionScaleText: $("#function-scale-text"),
                                         colourScaleText: $("#colour-scale-text")});
  
  controlDialog.initialize();
  initialValues = controlDialog.values;
  
  var numZeroes = 3;
  
  /* Create an array of repeated [0, 0] (i.e. 0+0i) */
  var zeroes = [];
  for (var i=0; i<numZeroes; i++) {
    zeroes.push([0, 0]);
  }
  
  /* The model of the polynomial function */
  var complexFunction = new PolynomialFunction({"zeroes": zeroes});

  var domkolDivElement = $("#domkol");
  
  var explorerView = createExplorerView(complexFunction, domkolDivElement, initialValues, 
                                        240, [280, 280], [560, 560], 150);
  
  for (i=0; i<numZeroes; i++) {
    var zeroHandle = explorerView.createNumberHandle((numZeroes-1)-i);
    $(zeroHandle).on("numberChanged", 
                     function(event, index, number, changing) {
                       complexFunction.updateZero(index, number, changing);
                     });
  }
  
  controlDialog.connect(explorerView);
});

function createExplorerView(complexFunction, domkolDivElement, initialValues, 
                            pixelsPerUnit, originPixelLocation, pixelsDimension, circleRadius) {
  
  /* The model of the circular subset of the complex plane */
  var domainCircle = new DomainCircle({circumferenceIncrementInPixels: 1});
  
  /* The main model of the application */
  var explorerModel = new ComplexFunctionExplorerModel({ f: complexFunction.getFunction(), 
                                                         pixelsPerUnit: pixelsPerUnit, 
                                                         originPixelLocation: originPixelLocation, 
                                                         pixelsDimension: pixelsDimension, 
                                                         circleRadius: circleRadius, 
                                                         domainCircle: domainCircle });
  
  var domkolElements = new DomkolElements(domkolDivElement[0], explorerModel.originPixelLocation, 
                                          explorerModel.pixelsDimension, explorerModel.circleRadius);
  domkolElements.initialize();
  
  /* The view of the "domain circle", including two draggable handles, the circle, the polar grid,  
     a checkbox controlling its visibility, and the paths of the real&imaginary values of f on the circle. */
  var domainCircleView = new DomainCircleView(domkolElements, 
                                              {showCircleGraph: initialValues.showCircleGraph, 
                                               show3D: initialValues.show3D, 
                                               wiggling: initialValues.wiggling,
                                               graphRotation: initialValues.graphRotation, 
                                               domainCircle: explorerModel.domainCircle});
  
  /* The view of the coordinates in the complex viewport. There is a grid for integral values, and  
     a finer one for multiples of 0.1 & 0.1i. Integral coordinate values are displayed, and there is 
     a checkbox controlling visibility of the coordinate grid. */
  var coordinatesView = new CoordinatesView(domkolElements, 
                                            {explorerModel: explorerModel, 
                                             showCoordinateGrid: initialValues.showCoordinateGrid});
  
  /* The main view of the application containing all its component views and associated models. */
  return new ComplexFunctionExplorerView({explorerModel: explorerModel, 
                                          canvas: domkolElements.canvas, 
                                          handlesDiv: domkolElements.handlesDiv, 
                                          domainCircleView: domainCircleView, 
                                          coordinatesView: coordinatesView, 
                                          functionScale: initialValues.functionScale, 
                                          colourScale: initialValues.colourScale, 
                                          repaintContinuously: initialValues.repaintContinuously, 
                                          complexFunction: complexFunction});
}
  
function ControlDialog(attributes) {
    setAttributes(this, attributes, 
                  [ "div", 
                    "wiggleCheckbox", 
                    "showCircleGraphCheckbox", 
                    "show3DGraphCheckbox", 
                    "rotateGraphSlider", 
                    "graphRotationText", 
                    "showCoordinateGridCheckbox", 
                    "functionScaleSlider", 
                    "colourScaleSlider", 
                    "repaintContinuouslyCheckbox", 
                    "formulaText", 
                    "functionScaleText", 
                    "colourScaleText"
                  ]);
}

ControlDialog.prototype = {
  initialize: function() {
    this.values = {};
    this.initializeWiggleCheckbox();
    this.initializeShowCircleGraphCheckbox();
    this.initializeShow3DGraphCheckbox();
    this.initializeRotateGraphSlider();
    this.initializeShowCoordinateGridCheckbox();
    this.initializeFunctionScaleSlider();
    this.initializeColourScaleSlider();
    this.initializeRepaintContinuouslyCheckbox();

    /* Make the controls window draggable by it's top bar. */
    $(this.div).draggable({handle: ".window-top-bar"});
  }, 
  
  initializeWiggleCheckbox: function() {
    this.values.wiggling = this.wiggleCheckbox[0].checked;
  }, 
  
  initializeShowCircleGraphCheckbox: function() {
    this.values.showCircleGraph = this.showCircleGraphCheckbox[0].checked;
  }, 
  
  initializeShow3DGraphCheckbox: function (){
    this.values.show3D = this.show3DGraphCheckbox[0].checked;
  }, 

  initializeRotateGraphSlider: function (){
    function getGraphRotationFromSliderValue(sliderValue) {
      var rotationAngle = ((sliderValue-50)/50.0)*Math.PI;
      var graphRotation = [Math.cos(rotationAngle), Math.sin(rotationAngle)];
      roundComponentsToIntegerIfClose(graphRotation, 0.0001);
      return graphRotation;
    }
    var rotateGraphSlider = this.rotateGraphSlider;
    function rotationChanged(event, ui) {
      var graphRotation = getGraphRotationFromSliderValue(ui.value);
      rotateGraphSlider.trigger("graphRotationChanged", [graphRotation]);
    }
    
    rotateGraphSlider.slider({"min": 0, "max": 100, "value": 50,
                              "orientation": "horizontal", 
                              "slide": rotationChanged, 
                              "change": rotationChanged});  
    setSliderKeyboardShortcuts(rotateGraphSlider);

    this.values.graphRotation = getGraphRotationFromSliderValue(rotateGraphSlider.slider("value"));
  }, 

  initializeShowCoordinateGridCheckbox: function (){
    this.values.showCoordinateGrid = this.showCoordinateGridCheckbox[0].checked;
  }, 

  initializeFunctionScaleSlider: function (){
    function getFunctionScaleFromSliderValue (sliderValue) {
      return 0.5 * Math.pow(1.08, sliderValue-50);
    }
    var functionScaleSlider = this.functionScaleSlider;
    function functionScaleChanged(event, ui) {
      var functionScale = getFunctionScaleFromSliderValue(ui.value);
      functionScaleSlider.trigger("functionScaleChanged", [functionScale]);
    }
    functionScaleSlider.slider({"min": 0, "max": 100, "value": 50, 
                                     "orientation": "horizontal", 
                                     "slide": functionScaleChanged, 
                                     "change": functionScaleChanged
                                    });
    setSliderKeyboardShortcuts(functionScaleSlider);
    this.values.functionScale = getFunctionScaleFromSliderValue(functionScaleSlider.slider("value"));
  }, 

  initializeColourScaleSlider: function (){
    function getColourScaleFromSliderValue (sliderValue) {
      return 1.0 * Math.pow(1.2, sliderValue-50);
    }
    var colourScaleSlider = this.colourScaleSlider;
    function colourScaleChanged(event, ui) {
      var colourScale = getColourScaleFromSliderValue(ui.value);
      colourScaleSlider.trigger("colourScaleChanged", [colourScale, false]);
    }
    function colourScaleChanging(event, ui) {
      var colourScale = getColourScaleFromSliderValue(ui.value);
      colourScaleSlider.trigger("colourScaleChanged", [colourScale, true]);
    }
    colourScaleSlider.slider({"min": 0, "max": 100, "value": 50, 
                              "orientation": "horizontal", 
                              "slide": colourScaleChanging, 
                              "change": colourScaleChanged 
                             });
    setSliderKeyboardShortcuts(colourScaleSlider);
    this.values.colourScale = getColourScaleFromSliderValue(colourScaleSlider.slider("value"));
  }, 

  initializeRepaintContinuouslyCheckbox: function (){
    this.values.repaintContinuously = this.repaintContinuouslyCheckbox[0].checked;
  }, 

  onProxied: function(object, eventName, handler) {
    var $this = this;
    $(object).on(eventName, function() {
      handler.apply($this, arguments);
    });
  },
  
  connect: function(explorerView) {
    var domainCircleView = explorerView.domainCircleView;
    var coordinatesView = explorerView.coordinatesView;
    var complexFunction = explorerView.complexFunction;
    
    this.connectRotateGraphSlider(domainCircleView);
    this.connectShowCircleGraphCheckbox(domainCircleView);
    this.connectGraphRotationText(domainCircleView);
    this.connectShow3DGraphCheckbox(domainCircleView);
    this.connectWiggleCheckbox(domainCircleView);
    this.connectShowCoordinateGridCheckbox(coordinatesView);
    this.connectFunctionScaleSlider(explorerView);
    this.connectColourScaleSlider(explorerView);
    this.connectFormulaText(complexFunction);
    this.connectFunctionScaleText(explorerView);
    this.connectColourScaleText(explorerView);
    this.connectRepaintContinuouslyCheckbox(explorerView);
  }, 
  
  connectWiggleCheckbox: function(domainCircleView) {
    this.wiggleCheckbox.on("change", function(event) {
      domainCircleView.setWiggling(this.checked);
    });
    this.onProxied(domainCircleView, "showing3DGraph", 
                   function(event, showing) { 
                     setCheckboxEnabled(this.wiggleCheckbox, showing); });
  }, 
  
  connectShowCircleGraphCheckbox: function(domainCircleView) {
    this.showCircleGraphCheckbox.on("change", function(event) {
      domainCircleView.setShowCircleGraph(this.checked);
    });
  }, 

  connectShow3DGraphCheckbox: function(domainCircleView) {
    this.show3DGraphCheckbox.on("change", function(event) {
      domainCircleView.setShow3D(this.checked);
    });
    this.onProxied(domainCircleView, "showingCircleGraph", function(event, showing) {
      setCheckboxEnabled(this.show3DGraphCheckbox, showing);
    });
  }, 

  connectRotateGraphSlider: function(domainCircleView) {
    this.rotateGraphSlider.on("graphRotationChanged", function(event, graphRotation) {
      domainCircleView.setGraphRotation(graphRotation);
    });
  }, 

  connectGraphRotationText: function(domainCircleView) {
    this.onProxied(domainCircleView, "graphRotationChanged", function(event, text) {
      this.graphRotationText.text(text);
    });
    domainCircleView.notifyGraphRotationChanged(); // to show initial value
  }, 

  connectShowCoordinateGridCheckbox: function(coordinatesView) {
    this.showCoordinateGridCheckbox.on("change", function(event) {
      coordinatesView.setShowCoordinateGrid(this.checked);
    });
  }, 

  connectFunctionScaleSlider: function(explorerView) {
    this.functionScaleSlider.on("functionScaleChanged", function(event, scale) {
      explorerView.setFunctionScale(scale);
    });
  }, 

  connectColourScaleSlider: function(explorerView) {
    this.colourScaleSlider.on("colourScaleChanged", function(event, scale, changing) {
      explorerView.setColourScale(scale, changing);
    });
  }, 

  connectRepaintContinuouslyCheckbox: function(explorerView) {
    this.repaintContinuouslyCheckbox.on("change", function(event) {
      explorerView.repaintContinuously = this.checked;
    });
  }, 

  connectFormulaText: function(complexFunction) {
    this.onProxied(complexFunction, "formulaChanged", function(event, formula) {
      this.formulaText.text(formula);
    });
    complexFunction.notifyFormulaChanged(); // to display initial value
  }, 

  connectFunctionScaleText: function(explorerView) {
    this.onProxied(explorerView, "functionScaleChanged", function(event, scale) {
      this.functionScaleText.text(reformatToPrecision(scale.toString(), 3));
    });
    explorerView.notifyFunctionScaleChanged(); // to display initial value
  }, 

  connectColourScaleText: function(explorerView) {
    this.onProxied(explorerView, "colourScaleChanged", function(event, scale) {
      this.colourScaleText.text(reformatToPrecision(scale.toString(), 3));
    });
    explorerView.notifyColourScaleChanged(); // to display initial value
  }

};
  
function DomkolElements(div, originPixelLocation, pixelsDimension, circleRadius) {
  this.div = div;
  this.originPixelLocation = originPixelLocation;
  this.pixelsDimension = pixelsDimension;
  this.width = pixelsDimension[0];
  this.height = pixelsDimension[1];
  this.originX = originPixelLocation[0];
  this.originY = originPixelLocation[1];
  this.circleRadius = circleRadius;
}

DomkolElements.prototype = {
  initialize: function() {
    this.initializeCanvas();
    this.initializeRealPathUnder();
    this.initializeAxesAndCircleGraph();
    this.initializeHandles();
  }, 
  initializeHandles: function() {
    var handlesDivWrapper = $("<div/>");
    $(this.div).append(handlesDivWrapper);
    this.handlesDiv = handlesDivWrapper[0];
  }, 
  initializeCanvas: function() {
    var canvas = $("<canvas/>");
    $(this.div).append(canvas);
    canvas.attr("style", "position:absolute;top:0;left:0;z-index:2;");
    canvas.attr("width", this.width.toString());
    canvas.attr("height", this.height.toString());
    this.canvas = canvas[0];
  }, 
  
  initializeRealPathUnder: function() {
    var svg = createSvgElement(this.div, "svg", 
                               {style: "position:absolute;top:0;left:0;z-index:1;", 
                                width: this.width, height: this.height, 
                                viewbox: "0 0 " + this.width + " " + this.height});
    var circleGraphUnder = createSvgElement(svg, "g");
    this.realPathUnder = createSvgElement(circleGraphUnder, "path", 
                                          {d: "M0,0", fill: "none", stroke: "blue", 
                                           "stroke-width": 5, "stroke-opacity": "1.0"});
  }, 
  initializeAxesAndCircleGraph: function() {
    var svg = createSvgElement(this.div, "svg", 
                               {style: "position:absolute;top:0;left:0;z-index:3;", 
                                width: this.width, height: this.height, 
                                viewbox: "0 0 " + this.width + " " + this.height});
    this.initializeAxes(svg);
    this.initializeCircleGraph(svg);
  }, 
  initializeAxes: function(svg) {
    this.coordinates = createSvgElement(svg, "g");
    this.coordinatesGroup = createSvgElement(this.coordinates, "g");
    this.axes = createSvgElement(this.coordinates, "path", 
                                 {d: "M0,0", stroke: "#909090", "stroke-width": "0.6"});
    this.unitCoordinateGrid = createSvgElement(this.coordinates, "path", 
                                               {d: "M0,0", stroke: "#909090", "stroke-width": "0.5"});
    this.fineCoordinateGrid = createSvgElement(this.coordinates, "path", 
                                               {d: "M0,0", stroke: "#909090", "stroke-width": "0.2"});
  }, 
  initializeCircleGraph: function(svg) {
    this.circleGraph = createSvgElement(svg, "g");
    this.bigCircle = createSvgElement(this.circleGraph, "circle", 
                                      {cx: this.originX, cy: this.originY, r: this.circleRadius, 
                                       stroke: "white", "stroke-width": 7, fill: "none"});
    this.polarGrid = createSvgElement(this.circleGraph, "path", 
                                      {d: "M0,0", fill: "none", stroke: "white", "stroke-width": "0.2"});
    this.polarGridCoarse = createSvgElement(this.circleGraph, "path", 
                                            {d: "M0,0", fill: "none", stroke: "white", "stroke-width": "0.4"});
    this.realPath = createSvgElement(this.circleGraph, "path", 
                                     {d: "M0,0", fill: "none", stroke: "blue", "stroke-width": "5"});
    this.realPathShadow = createSvgElement(this.circleGraph, "path", 
                                           {d: "M0,0", fill: "none", stroke: "#404040", 
                                            "stroke-width": "5", "stroke-opacity": "0.08"});
    this.realPathShadow2 = createSvgElement(this.circleGraph, "path", 
                                            {d: "M0,0", fill: "none", stroke: "#404040", 
                                             "stroke-width": "5", "stroke-opacity": "0.05"});
    this.imaginaryPath = createSvgElement(this.circleGraph, "path", 
                                          {d: "M0,0", fill: "none", stroke: "#302010", "stroke-width": "5"});
    this.centreHandle = createSvgElement(this.circleGraph, "circle", 
                                         {transform: "translate(" + this.originX + " " + this.originY + ")", 
                                          cx: "0", cy: "0", r: "7", 
                                          stroke: "white", "stroke-width": "2", fill: "black"});
    this.edgeHandle = createSvgElement(this.circleGraph, "circle", 
                                       {transform: ("translate(" + (this.originX + this.circleRadius) + 
                                                    " " + this.originY + ")"), 
                                        cx: "0", cy: "0", r: "7", 
                                        stroke: "white", "stroke-width": "2", fill: "black"});
  }
};

function setSliderKeyboardShortcuts(slider) {
  var initialValue = slider.slider("value");
  slider.keypress(function(e) { 
    var char = String.fromCharCode(e.which);
    if (char == "c") {
      slider.slider("value", initialValue);
    }
  });
}

function setBooleanElementAttibute(element, attribute, value) {
  if (value) {
    element.attr(attribute, true);
  }
  else {
    element.removeAttr(attribute);
  }
}

function setCheckboxEnabled(checkbox, enabled) {
  setBooleanElementAttibute(checkbox, "disabled", !enabled);
}

function setCheckboxChecked(checkbox, checked) {
  setBooleanElementAttibute(checkbox, "checked", checked);
}

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

/* Create 3 SVG path attributes for an array of 3D points -
 3rd value of point determines which path it belongs to
 for over, under and "shadow" */

function createOverUnderAndShadowPointPaths(points) {
  var pointStrings = [new Array(), new Array(), new Array(), new Array()];
  var currentPath = -1; // initially neither 0 or 1
  var currentPointNum = -1; // Initially not 0 or 1
  var dashLength = 9;
  var dashGap = 2
  var dashPos = 0;
  for (var i=0; i<points.length; i++) {
    var point = points[i];
    var whichPath = point[2] >= 0 ? 0 : 1; // over = 1st path, under = 2nd path
    if (whichPath != currentPath) {
      currentPointNum = 0;
      currentPath = whichPath;
    }
    else {
      currentPointNum++;
    }
    dashPos = i % dashLength;
    if (dashPos == 0) {
      currentPointNum = 0;
    }
    if (dashPos + dashGap < dashLength) {
      var prefix = currentPointNum == 0 ? "M" : (currentPointNum == 1 ? "L" : "");
      var pointString = prefix + (0.001*Math.round(point[0]*1000)) + "," + 
        (0.001*Math.round(point[1]*1000));
      pointStrings[whichPath].push(pointString);
      if (whichPath == 0) { // if "above", then do the shadow
        var shadowPoint = [point[0] + point[2], point[1] + point[2]]; // simple 45 deg altitude NW lighting
        var shadowPointString = prefix + (0.001*Math.round(shadowPoint[0]*1000)) + "," + 
          (0.001*Math.round(shadowPoint[1]*1000));
        pointStrings[2].push(shadowPointString);
        shadowPoint = [point[0] + 0.7 * point[2], point[1] + 0.5 * point[2]]; // 2nd shadow from second higher light
        shadowPointString = prefix + (0.001*Math.round(shadowPoint[0]*1000)) + "," + 
          (0.001*Math.round(shadowPoint[1]*1000));
        pointStrings[3].push(shadowPointString);
      }
    }
  }
  return [pointStrings[0].join(" "), pointStrings[1].join(" "), 
          pointStrings[2].join(" "), pointStrings[3].join(" ")];
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

/* Set attributes on a Javascript object from an object literal and an array of keys, 
   JQuery-wrapping each value. */
function setJQueryWrappedAttributes(object, attributes, keys) {
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    if (attributes.hasOwnProperty(key)) {
      object[key] = $(attributes[key]);
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

  // attributes set by view: centreHandlePosition, edgeHandlePosition, radius, graphRotation, wiggleAngle
}

DomainCircle.prototype = {

  /** Calculate and store the radius value (in pixels) */
  calculateRadius: function() {
    var edgeX = this.edgeHandlePosition[0];
    var edgeY = this.edgeHandlePosition[1];
    this.radius = Math.sqrt(edgeX*edgeX + edgeY*edgeY);
  }, 
  
  /* Return real & imaginary of f on the domain circle as arrays of points (in pixel coordinates) */
  functionGraphPointArrays: function () {
    var explorerModel = this.explorerModel;
    var unitsPerPixel = explorerModel.unitsPerPixel();
    var cx = this.centreHandlePosition[0]; // pixel X coordinate of circle centre
    var cy = this.centreHandlePosition[1]; // pixel X coordinate of circle centre
    var r = this.radius; // radius of circle in pixels
    var angleIncrement = this.circumferenceIncrementInPixels / r; // How often to recalculate f going round the circle
    var numSteps = 2*Math.PI/angleIncrement; // Number of values of f that will be calculated
    var pointsReal = new Array(); // Array of points representing the real components of value of f
    var pointsReal3D = new Array(); // Array of points representing the real components of value of f + imaginary in Z-axis
    var pointsImaginary = new Array(); // Array of points representing the real components of value of f
    var theta = 0; // Current angular position in circle
    var f = explorerModel.f; // The function
    var minX = explorerModel.minX(); // Minimum x value in complex viewport (in units)
    var minY = explorerModel.minY(); // Minimum y value in complex viewport (in units)
    var heightInPixels = explorerModel.heightInPixels(); // Height of complex viewport in pixels
    var scaleFPixels = explorerModel.scaleF/unitsPerPixel; // How a unit maps to pixels in the displayed f values.
    var wiggleAngle = this.wiggleAngle;
    for (var i=0; i<numSteps+1; i++) {
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var px = cx + r * sinTheta; // re(z) pixel coordinate
      var py = cy + r * cosTheta; // im(z) pixel coordinate
      var x = minX + px * unitsPerPixel; // re(z) unit coordinate
      var y = minY + (heightInPixels - 1 - py) * unitsPerPixel; // im(z) unit coordinate
      var fValue = f([x, y]); // calculated value of f
      fValue = times(this.graphRotation, fValue);
      var rReal = r + fValue[0] * scaleFPixels; // represented location of re(fValue) in pixels from circle centre
      var rImaginary = r + fValue[1] * scaleFPixels; // represented location of im(fValue) in pixels from circle centre
      var realX = rReal * sinTheta + cx;
      var realY = rReal * cosTheta + cy;
      var imaginaryZ = fValue[1] * scaleFPixels;
      pointsReal[i] = [realX, realY]; // add pixel coordinate of re(fValue) to real path
      realX += wiggleAngle * imaginaryZ;
      pointsReal3D[i] = [realX, realY, imaginaryZ];
      pointsImaginary[i] = [rImaginary * sinTheta + cx, rImaginary * cosTheta + cy]; // add pixel coordinate of im(fValue)
      theta += angleIncrement; // step around to angle of next value to compute
    }
    return {real: pointsReal, imaginary: pointsImaginary, real3D: pointsReal3D};
  }
};

/** The main model of the application */
function ComplexFunctionExplorerModel(attributes) {
  setAttributes(this, attributes, 
                ["f", /** The complex function, satisfying f([re(z),im(z)]) = [re(f(z)),im(f(z))] */
                 "pixelsPerUnit", /** How many pixels make one complex unit? */
                 "originPixelLocation", /** What is the pixel location of the complex origin? */
                 "pixelsDimension", /** pixelsDimension = [width, height], width & height of complex viewport in pixels */
                 "circleRadius", /** Initial radius of the domain circle */
                 "domainCircle"]);/* multiply re(f) and im(f) values by colourScale to get values 
                                    where values in range -1 to 1.0 are represented by 0 to 255
                                    in the specified RGB components. (currently hardcoded to real=>R, imaginary=>G)*/
  
  // attributes set by view: scaleF, colourScale
    
  this.domainCircle.explorerModel = this; // link to parent
}

ComplexFunctionExplorerModel.prototype = {
  /** minimum value of X = re(z) in complex viewport */
  minX: function() { return -(this.originPixelLocation[0]/this.pixelsPerUnit); }, 
  
  /** minimum value of Y = im(z) in complex viewport */
  minY: function() { return (this.originPixelLocation[1]-this.heightInPixels())/this.pixelsPerUnit; }, 

  /** How much the z value in complex units changes per pixel */
  unitsPerPixel: function() {return 1.0/this.pixelsPerUnit;}, 
    
  /** Width of complex viewport in pixels */
  widthInPixels: function() { return this.pixelsDimension[0]; },     
  
  /** Height of complex viewport in pixels */
  heightInPixels: function() { return this.pixelsDimension[1]; }, 
  
  /** Convert pixel position to a complex number */
  positionToComplexNumber: function(x, y) {
    return [(x-this.originPixelLocation[0])/this.pixelsPerUnit, 
            (this.originPixelLocation[1]-y)/this.pixelsPerUnit];
  }, 
  
  /** Compute f for every pixel and write the representative colour values
      to the "data" array in the format that can be directly written to HTML canvas element. */
  writeToCanvasData: function(data) {
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
        data[k+3] = 200;
        y += unitsPerPixel;
      }
      x += unitsPerPixel;
    }
  }
};
  
/** The view for the circular domain which displays values of f for points on the circle
    as two separate real and imaginary graphs.*/
function DomainCircleView (domkolElements, attributes) {
  this.dom = {};
  setJQueryWrappedAttributes(this.dom, domkolElements, 
                             ["circleGraph", /** element contain the whole view (for showing/hiding) */
                              "centreHandle", /** centre handle which is a SVG circle */
                              "edgeHandle", /** edge handle which is a SVG circle */
                              "bigCircle", /** SVG circle element representing the subset of the domain*/
                              "polarGrid", /** SVG path representing 
                                               the polar grid (circles & radial axes) */
                              "polarGridCoarse", /** SVG path representing 
                                                     the "coarse" part of polar grid, inner&outer radial circles and 
                                                     vert&horiz radial axes  */
                              "realPath", /** SVG path representing real parts of f on the domain circle */
                              "imaginaryPath", /** SVG path representing imaginary parts of f 
                                                   on the domain circle */
                              "realPathUnder", /** SVG path representing real parts of f on the domain circle 
                                                   for negative imaginary value */
                              "realPathShadow", /** SVG path representing shadow of real parts of f on the 
                                                    domain circle for positive imaginary value */
                              "realPathShadow2"]); /** SVG path representing 2nd shadow of real parts of f on 
                                               the domain circle for positive imaginary value */
                             
  setAttributes(this, attributes, 
                ["domainCircle",  /** An object of class DomainCircle, the model for this view */
                 "showCircleGraph", /** Initial state of showing the circle graph */
                 "show3D", /** Initial state of showing 3D graph (instead of 2D) */
                 "wiggling",  /** Initial state of wiggling or not */
                 "graphRotation"]); /** Initial graph rotation (usually 1.0) */
  
  svgDraggable(this.dom.centreHandle); // Make the centre handle (which is an SVG element) draggable
  svgDraggable(this.dom.edgeHandle); // Make the edge handle (which is an SVG element) draggable
  
  /** Set local variable values for access inside inner functions */
  var view = this;
  var domainCircle = this.domainCircle;
  domainCircle.graphRotation = this.graphRotation;

  // drag the centre handle to move the domain circle around
  this.dom.centreHandle.on('svgDrag', function(event, x, y) {
    view.dom.bigCircle.attr({cx: x, cy: y}); // Move the centre of the domain circle
    var edgePos = domainCircle.edgeHandlePosition;
    setTranslation(view.dom.edgeHandle, x + edgePos[0], y + edgePos[1]); // Also move the edge handle
    view.updateCirclePosition();
    view.drawFunctionOnCircle();
  });
  
  // drag the edge handle to change the radius of the domain circle
  this.dom.edgeHandle.on('svgDrag', function(event, x, y) {
    view.updateCirclePosition();
    view.dom.bigCircle.attr('r', domainCircle.radius); // Change the radius of the domain circle
    view.drawFunctionOnCircle();
  });
  
  view.updateGraphVisibility();
  
  function rotationChanged(event, ui) {
    view.rotationUpdated(ui.value);
  }
  
  this.initializeWiggleAngles();
  
  setInterval(function(){ 
    if (view.wiggling) { 
      view.wiggleOneStep();
    }
  }, 80);
  
  // initial update of model for the initial state of the view
  this.updateCirclePosition();
}

/** For numbers which are probably exact complex integers, but not quite due to rounding
    errors, use this function to round them exactly. */
function roundComponentsToIntegerIfClose(number, epsilon) {
  for (var i=0; i<2; i++) {
    var closestInteger = Math.round(number[i]);
    if (Math.abs(number[i]-closestInteger) < epsilon) {
      number[i] = closestInteger;
    }
  }
}

DomainCircleView.prototype = {
  
  setShowCircleGraph: function(showing) {
    this.showCircleGraph = showing;
    this.updateGraphVisibility();
  },
  
  setShow3D: function(showing) {
    this.show3D = showing;
    this.updateGraphVisibility();
    if (!this.wiggling) {
      this.domainCircle.wiggleAngle = 0;
    }      
    this.drawFunctionOnCircle();
  }, 
  
  setWiggling: function(wiggling) {
    this.wiggling = wiggling;
    if (!wiggling) {
      this.domainCircle.wiggleAngle = 0;
      this.drawFunctionOnCircle();
    }
  }, 
  
  initializeWiggleAngles: function() {
    var maxWiggle = 0.3;
    var numWiggles = 15;
    this.wiggleAngles = new Array(numWiggles);
    for (var i=0; i<numWiggles; i++) {
      var angleAngle = (Math.PI * 2 * i)/numWiggles;
      this.wiggleAngles[i] = maxWiggle * Math.sin(angleAngle);
    }
    this.wiggleIndex = 0;
    this.domainCircle.wiggleAngle = this.wiggleAngles[this.wiggleIndex];
  }, 
  
  wiggleOneStep: function() {
    this.wiggleIndex = (this.wiggleIndex+1) % this.wiggleAngles.length;
    this.domainCircle.wiggleAngle = this.wiggleAngles[this.wiggleIndex];
    this.drawFunctionOnCircle();
  },    
  
  /** Update the circle position from view changes. */
  updateCirclePosition: function() {
    this.domainCircle.centreHandlePosition = getTranslation(this.dom.centreHandle);
    this.domainCircle.edgeHandlePosition = minus(getTranslation(this.dom.edgeHandle), 
                                                 this.domainCircle.centreHandlePosition);
    this.domainCircle.calculateRadius();
  }, 
  
  setGraphRotation: function(graphRotation) {
    this.domainCircle.graphRotation = graphRotation;
    this.notifyGraphRotationChanged();
    this.drawFunctionOnCircle();
  }, 
  
  notifyGraphRotationChanged: function() {
    var graphRotation = this.domainCircle.graphRotation;
    $(this).trigger("graphRotationChanged", formatComplexNumber(graphRotation[0], graphRotation[1], 2));
  }, 
  
  // changes determined by "show circle" & "show 3D"
  updateGraphVisibility: function() {
    this.dom.circleGraph.toggle(this.showCircleGraph);
    var showing3DGraph = this.showCircleGraph && this.show3D;
    this.dom.realPathUnder.toggle(showing3DGraph);
    this.domainCircle.show3DGraph = this.show3D;
    this.dom.bigCircle.attr("stroke-width", this.show3D ? 7 : 2);
    this.dom.realPath.attr("stroke-width", this.show3D ? 5 : 2);
    this.dom.imaginaryPath.attr("stroke-width", this.show3D ? 5 : 2);
    this.dom.realPathUnder.toggle(this.showCircleGraph && this.show3D); // this DOM element not part of circleGraph
    this.dom.realPathShadow.toggle(this.show3D);
    this.dom.realPathShadow2.toggle(this.show3D);
    this.dom.imaginaryPath.toggle(!this.show3D);
    $(this).trigger("showingCircleGraph", [this.showCircleGraph]);
    $(this).trigger("showing3DGraph", [showing3DGraph]);
  }, 
  
  /** Calculate and draw the real & imaginary paths. Also draw the polar grid. */
  drawFunctionOnCircle: function() {
    var pointArrays = this.domainCircle.functionGraphPointArrays();
    var show3DGraph = this.domainCircle.show3DGraph;
    
    if (this.domainCircle.show3DGraph) {
      var paths = createOverUnderAndShadowPointPaths(pointArrays["real3D"]);
      this.dom.realPath.attr("d", paths[0]);
      this.dom.realPathUnder.attr("d", paths[1]);
      this.dom.realPathShadow.attr("d", paths[2]);
      this.dom.realPathShadow2.attr("d", paths[3]);
    }
    else {
      var realPathD = createPointsPath(pointArrays["real"]);
      var imaginaryPathD = createPointsPath(pointArrays["imaginary"]);
      this.dom.realPath.attr("d", realPathD);
      this.dom.imaginaryPath.attr("d", imaginaryPathD);
    }
    this.drawPolarGrid();
  }, 
  
  /** Draw the polar grid. Circles represent the range of f values from -1.0 to 1.0,
      in steps of 0.1. (When the f values are "scaled" via the slider, the polar grid is resized to match, 
      so the grid is always showing actual f values.) Also shows radial axes every 15 degrees.
      There are two paths, one "coarse" ("coarsePathComponents" showing the more important parts of the grid
      using thicker lines) and one "fine" ("pathComponents" for showing all the grid using thinner lines).
  */
  drawPolarGrid: function() {
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
    this.dom.polarGrid.attr("d", pathComponents.join(" "));
    this.dom.polarGridCoarse.attr("d", coarsePathComponents.join(" "));
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
  getFunction: function() {
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
  getFormula: function() {
    var formula = "";
    var zeroes = this.zeroes;
    for (var i=0; i<zeroes.length; i++) {
      var zero = zeroes[i];
      formula += ("(" + formatVariablePlusComplexNumber("z", -zero[0], -zero[1], 2) + ")");
    }
    return formula;
  }, 
  
  updateZero: function(index, number, changing) {
    this.zeroes[index] = number;
    this.notifyFormulaChanged();
    this.notifyFunctionChanged(changing);
  }, 
  
  notifyFormulaChanged: function() {
    $(this).trigger("formulaChanged", [this.getFormula()]);
  }, 
  
  notifyFunctionChanged: function(changing) {
    $(this).trigger("functionChanged", [changing]);
  }
    
};

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

/** Regex to parse the normal Javascript representation of a float value */
var decimalNumberRegexp = /^(-|)([0-9]*|)([.][0-9]*|)(e[-+]?[0-9]+|)$/

/** Reformat a Javascript number to show no more than specified number of 
    decimal places (but don't trim trailing 0's) */
function reformatToPrecision(numberString, precision) {
  var match = decimalNumberRegexp.exec(numberString);
  var minusSign = match[1];
  var wholeNumber = match[2];
  var decimalPart = match[3].substring(0, precision+1);
  var exponentPart = match[4]; 
  if (exponentPart != "") {
    var exponent = parseInt(exponentPart.substring(1));
    var digits = wholeNumber + (match[3] == "" ? "" : match[3].substring(1));
    var decimalPos = wholeNumber.length + exponent;
    var newNumberString;
    if (decimalPos < 0) {
      for (var i=0; i<-decimalPos; i++) {
        digits = "0" + digits;
      }
      newNumberString = "." + digits;
    }
    else if (decimalPos > digits.length) {
      for (var i=digits.length; i<decimalPos; i++) {
        digits = digits + "0";
      }
      newNumberString = digits;
    }
    else {
      newNumberString = digits.substring(0, decimalPos) + "." + digits.substring(decimalPos);
    }
    newNumberString = minusSign + newNumberString;
    var reformattedWithoutExponent = reformatToPrecision(newNumberString, precision);
    return reformattedWithoutExponent;
  }
  else {
    return minusSign + wholeNumber + decimalPart + exponentPart;
  }
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
function createSvgElement(parent, tag, attributes) {
  var svgElement= document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var key in attributes)
    svgElement.setAttribute(key, attributes[key].toString());
  if (parent != null) {
    parent.appendChild(svgElement);
  }
  return svgElement;
}

/** The view representing the coordinates in the complex plane as displayed within the complex viewport */
function CoordinatesView(domkolElements, attributes) {
  this.dom = {};
  setJQueryWrappedAttributes(this.dom, domkolElements, 
                             ["coordinates", /** element containing all the coordinate elements */
                              "coordinatesGroup", /** element containing all the coordinate elements */
                              "axes", /** SVG path representing the real & imaginary axes */
                              "unitCoordinateGrid", /** SVG path representing the grid with spacing 1 complex unit */
                              "fineCoordinateGrid"]); /** SVG path representing the grid with spacing 0.1 complex units */
                               
  setAttributes(this, attributes, 
                ["explorerModel", /** A reference to the main application model */
                 "showCoordinateGrid"]); /** Initial visibility of the coordinates */
  
  /** Note: the SVG text elements for coordinate values are generated dynamically */
  
  // put view in local variable for access by event handlers
  var view = this;
  
  this.setShowCoordinateGrid(this.showCoordinateGrid);
  
  this.redraw();
}

CoordinatesView.prototype = {
  
  xCoordinateOffset: 3, // amount to offset (rightwards) the bottom left corner of coordinate value from actual location
  yCoordinateOffset: 3, // amount to offset (upwards) the bottom left corner of coordinate value from actual location
  
  setShowCoordinateGrid: function(showing) {
    this.showCoordinateGrid = showing;
    this.dom.coordinates.toggle(showing);
  }, 
  
  /** Add an SVG coordinate text element for a coordinate location with bottom left corner at pixel location x,y */
  addCoordinatesText: function(text, x, y) {
    var textElement = createSvgElement(this.dom.coordinatesGroup[0], "text", 
                                       {class: "coordinates", x: x, y: y, fill: "#d0d0ff"})
    var textNode = document.createTextNode(text);
    textElement.appendChild(textNode);
  }, 
  
  /** Return SVG path component for a horizontal axis for y = im(z). */
  horizontalPath: function (y) {
    var maxX = this.explorerModel.pixelsDimension[0];
    var yPixels = this.explorerModel.originPixelLocation[1] + this.explorerModel.pixelsPerUnit * y;
    return "M0," + yPixels + " L" + maxX + "," + yPixels;
  }, 
  
  /** Return SVG path component for a vertical axis for x = re(z). */
  verticalPath: function (x) {
    var maxY = this.explorerModel.pixelsDimension[1];
    var xPixels = this.explorerModel.originPixelLocation[0] + this.explorerModel.pixelsPerUnit * x;
    return "M" + xPixels + ",0 L" + xPixels + "," + maxY;
  }, 
  
  /** Draw the coordinate grid with specified spacing (in complex units) into the SVG path component */
  drawGrid: function(gridPathElement, spacing, showCoordinateLabels) {
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
      this.dom.coordinatesGroup.empty();
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
  redraw: function() {
    var origin = this.explorerModel.originPixelLocation;
    var dimension = this.explorerModel.pixelsDimension;
    this.dom.axes.attr("d", this.horizontalPath(0) + " " + this.verticalPath(0));
    
    this.drawGrid(this.dom.unitCoordinateGrid, 1.0, true);
    this.drawGrid(this.dom.fineCoordinateGrid, 0.1, false);
  }
};

function NumberHandle(complexFunctionExplorerView, handlesDiv, index, position) {
  this.complexFunctionExplorerView = complexFunctionExplorerView;
  this.explorerModel = this.complexFunctionExplorerView.explorerModel;
  this.index = index;
  this.position = position;
  this.handlesDiv = handlesDiv;
  this.initializeHandleDiv(position);
  this.initializeDragHandler();
  this.number = this.positionToNumber(position);
  this.setNumberLabel();
}

NumberHandle.prototype = {
  positionToNumber: function(position) {
    return this.explorerModel.positionToComplexNumber(position[0], position[1]);
  }, 
  
  initializeHandleDiv: function(position) {
    this.handleDiv = $('<div/>');
    this.handleDiv.addClass("zero");
    this.handleDiv.css({position: "absolute", 
                        left: (position[0] + 2) + "px", 
                        top: (position[1]-23) + "px", 
                        "z-index": 4});
    $(this.handlesDiv).append(this.handleDiv);
    this.pointCircle = $('<div/>');
    this.pointCircle.addClass("point-circle");
    this.pointCircle.css({position: "absolute", 
                          left: "-4px", 
                          top: "21px"})
    this.handleDiv.append(this.pointCircle);
    this.zeroText = $('<div/>');
    this.zeroText.addClass("zero-text");
    this.zeroText.text("zero");
    this.handleDiv.append(this.zeroText);
  }, 
  
  setNumberLabel: function() {
    var formattedNumber = formatComplexNumber(this.number[0], this.number[1], 2);
    this.zeroText.text(formattedNumber);
  },    
  
  initializeDragHandler: function() {
    var pointCircle = this.pointCircle;
    var pointXOffset = fromPx(pointCircle.css("left")) + fromPx(pointCircle.css("width"))/2;
    var pointYOffset = fromPx(pointCircle.css("top")) + fromPx(pointCircle.css("height"))/2;
    var $this = this;
    
    function changeNumber(ui, changing) {
      $this.position = [ui.position.left + pointXOffset, ui.position.top + pointYOffset];
      $this.number = $this.positionToNumber($this.position);
      $this.setNumberLabel();
      $($this).trigger("numberChanged", [$this.index, $this.number, changing]);
    }
    
    /** When dragged, update the corresponding zero in the function model, and tell the 
        explorer view to redraw & repaint everything that depends on the function. */
    this.handleDiv.draggable({drag: function(event, ui) { changeNumber(ui, true); }, 
                              stop: function(event, ui) { changeNumber(ui, false); }});
    this.handleDiv.css("cursor", "move");
  }
};
  
/** The main view for the application */
function ComplexFunctionExplorerView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", /** The model for this view */
                 "canvas", /** JQuery wrapper for the canvas element, onto which the domain colouring is painted */
                 "handlesDiv", /** JQuery wrapper for div element containing any number handles */
                 "domainCircleView", /** Object of class DomainCircleView, being the domain circle view*/
                 "coordinatesView", /** Object of class CoordinatesView, being the coordinates view */
                 "functionScale", /** Initial value for functionScale */
                 "colourScale", /** the colour scale of the domain colouring */
                 "complexFunction", /** Object of class PolynomialClass (or other object with a similar interface), 
                                        being the model of the complex function being visualised*/
                 "repaintContinuously"]); /** whether or not to continuously repaint */
  var view = this;
  
  this.explorerModel.scaleF = this.functionScale;
  this.explorerModel.colourScale = this.colourScale;

  this.functionChanged(false); // force initial repaint
  
  $(this.complexFunction).on("functionChanged", function(event, changing) {
    view.functionChanged(changing);
  });
}

ComplexFunctionExplorerView.prototype = {
  
  createNumberHandle: function(index) {
    return new NumberHandle(this, this.handlesDiv, index, this.explorerModel.originPixelLocation);
  }, 
  
  /** The function has changed (e.g. from dragging the zeroes around), and may or may not
      have finished changing. Optionally repaint the domain 
      colouring, and redraw the function graph on the domain circle.*/
  functionChanged: function(changing) {
    this.drawDomainColouring(changing);
    this.drawFunctionGraphs(changing);
  },    
  
  /** The function is changing, but has not yet finished changing. */
  functionChanging: function() {
    this.functionChanged(true);
  }, 
  
  setColourScale: function(scale, changing) {
    this.explorerModel.colourScale = scale;
    this.notifyColourScaleChanged();
    this.drawDomainColouring(changing);
  }, 
  
  /** Set the function scale (for displaying the domain circle graph) in the model 
      after the user has changed in manually. */
  setFunctionScale: function(scale) {
    this.explorerModel.scaleF = scale;
    this.notifyFunctionScaleChanged();
    this.drawFunctionGraphs();
  }, 
  
  notifyFunctionScaleChanged: function() {
    $(this).trigger("functionScaleChanged", [this.explorerModel.scaleF]);
  }, 
  
  notifyColourScaleChanged: function() {
    $(this).trigger("colourScaleChanged", [this.explorerModel.colourScale]);
  }, 
  
  /** Draw all function graphs (of which there is only one currently - the function graph on the domain circle) */
  drawFunctionGraphs: function() {
    this.domainCircleView.drawFunctionOnCircle();
  }, 
  
  /** repaint the domain colouring into the canvas element */
  drawDomainColouring: function(changing) {
    if (!changing || this.repaintContinuously) {
      var ctx = this.canvas.getContext("2d");
      var imageData = ctx.createImageData(this.explorerModel.widthInPixels(), 
                                          this.explorerModel.heightInPixels());
      this.explorerModel.writeToCanvasData(imageData.data);
      ctx.putImageData(imageData, 0, 0);
    }
  }
    
}
