$(document).ready(function(){
  
  var numZeroHandles = $('#zero-handles').children(".zero").length;
  
  var zeroes = [];
  for (var i=0; i<numZeroHandles; i++) {
    zeroes.push([0, 0]);
  }
  
  var complexFunction = new PolynomialFunction({"zeroes": zeroes});
  
  var domainCircle = new DomainCircle({circumferenceIncrementInPixels: 1});
  
  var explorerModel = new ComplexFunctionExplorerModel({ f: complexFunction.getFunction(), 
                                                         pixelsPerUnit: 240, 
                                                         originPixelLocation: [280, 280], 
                                                         pixelsDimension: [560, 560], 
                                                         colourScale: 1.0,
                                                         scaleMax: 100, 
                                                         domainCircle: domainCircle });
  
  var functionView = new PolynomialFunctionView({"zeroHandles": $('#zero-handles'), 
                                                 functionModel: complexFunction, 
                                                 explorerModel: explorerModel});
  
  var domainCircleView = new DomainCircleView({circleGraph: $('#circle-graph'), 
                                               centreHandle: $('#centre-handle'), 
                                               edgeHandle: $('#edge-handle'), 
                                               bigCircle: $("#big-circle"), 
                                               polarGrid: $("#polar-grid"), 
                                               polarGridCoarse: $("#polar-grid-coarse"), 
                                               realPath: $("#real-path"), 
                                               imaginaryPath: $("#imaginary-path"), 
                                               showCircleGraphCheckbox: $("#show-circle-graph-checkbox"), 
                                               domainCircle: explorerModel.domainCircle});
  
  var coordinatesView = new CoordinatesView({coordinates: $('#coordinates'), 
                                             axes: $('#axes'), 
                                             unitGrid: $('#unit-coordinate-grid'), 
                                             fineGrid: $('#fine-coordinate-grid'), 
                                             showCoordinateGridCheckbox: $("#show-coordinate-grid-checkbox"), 
                                             explorerModel: explorerModel });
  
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
  
  $(".controls").draggable({ handle: ".window-top-bar" });
});

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

// Note: allow for "," in between coordinates, even though that should not happen (but windows Firefox puts it there)
var translateRegexp = /^translate[(]([-0-9.]+)[, ]+([-0-9.]+)[)]$/;

function getTranslation(handle) {
  var transform = handle.attr("transform");
  var translateRegexpMatch = translateRegexp.exec(transform);
  if (translateRegexpMatch == null) {
    throw "Invalid transform attribute (not a simple translate(x y)): " + transform;
  }
  return [parseInt(translateRegexpMatch[1]), parseInt(translateRegexpMatch[2])];
}

function setTranslation(handle, x, y) {
  handle.attr("transform", "translate(" + x + " " + y + ")");
}  

function svgDraggable(handle) {
  var translateRegexp = /^translate[(]([-0-9.]+)[ ]+([-0-9.]+)[)]$/;
  var position = getTranslation(handle); // test that the transform attribute is set properly
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
      handle.css({'left' : '0', 'top' : '0'}); /* remove CSS changes that Jquery UI makes 
                      (We have replaced those CSS changes with setTranslation because the CSS 
                      properties set by JQuery UI don't work in all browser. But when
                      the CSS changes do work, we want to reset them, to avoid
                      getting a double effect.) */
      var position = getTranslation(handle);
      var x = position[0];
      var y = position[1];
      handle.trigger('svgDragStop', [x, y]);
    })      
  ;
}

// Draw an array of 2D points (each point is an array) into an SVG path
function drawPointsPath(svgPath, points) {
  var pointStrings = new Array();
  for (var i=0; i<points.length; i++) {
    pointStrings[i] = (0.001*Math.round(points[i][0]*1000) + "," + 
                       0.001*Math.round(points[i][1]*1000));
  }
  pointStrings[0] = "M" + pointStrings[0];
  pointStrings[1] = "L" + pointStrings[1];
  var pathString = pointStrings.join(" ");
  svgPath.attr("d", pathString);
}

function pathCircleComponent(cx, cy, r) {
  return "M" + cx + "," + cy + " " +
    "m " + (-r) + ",0 " + 
    "a " + r + "," + r + " 0 1,0 " + (2*r) + ",0 " +
    "a " + r + "," + r + " 0 1,0 " + (-2*r) + ",0";
}

function minus(z1, z2) {
  return [z1[0]-z2[0], z1[1]-z2[1]];
}

function times(z1, z2) {
  return [z1[0]*z2[0] - z1[1]*z2[1], 
          z1[0]*z2[1] + z1[1]*z2[0]];
}

function square(z) {
  return times(z, z);
}

function cube(z) {
  return times(z, times(z, z));
}

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

function DomainCircle(attributes) {
  setAttributes(this, attributes, 
                ["circumferenceIncrementInPixels"]);
  // attributes set by view: centreHandlePosition, edgeHandlePosition, radius
}

DomainCircle.prototype = {
  "calculateRadius": function() {
    var edgeX = this.edgeHandlePosition[0];
    var edgeY = this.edgeHandlePosition[1];
    this.radius = Math.sqrt(edgeX*edgeX + edgeY*edgeY);
  }, 
  
  // return real & imaginary paths as arrays of points
  "functionGraphPointArrays": function () {
    var explorerModel = this.explorerModel;
    var unitsPerPixel = explorerModel.unitsPerPixel();
    var cx = this.centreHandlePosition[0];
    var cy = this.centreHandlePosition[1];
    var r = this.radius;
    var angleIncrement = this.circumferenceIncrementInPixels / r;
    var numSteps = 2*Math.PI/angleIncrement;
    var pointsReal = new Array();
    var pointsImaginary = new Array();
    var theta = 0;
    var f = explorerModel.f;
    var minX = explorerModel.minX();
    var minY = explorerModel.minY();
    var xRange = explorerModel.xRange();
    var yRange = explorerModel.yRange();
    var heightInPixels = explorerModel.heightInPixels();
    var scaleFPixels = explorerModel.scaleF/unitsPerPixel;
    for (var i=0; i<numSteps+1; i++) {
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var px = cx + r * sinTheta;
      var py = cy + r * cosTheta;
      var x = minX + px * unitsPerPixel;
      var y = minY + (heightInPixels - 1 - py) * unitsPerPixel;
      var fValue = f([x, y]);
      var rReal = r + fValue[0] * scaleFPixels;
      var rImaginary = r + fValue[1] * scaleFPixels;
      pointsReal[i] = [rReal * sinTheta + cx, rReal * cosTheta + cy];
      pointsImaginary[i] = [rImaginary * sinTheta + cx, rImaginary * cosTheta + cy];
      theta += angleIncrement;
    }
    return [pointsReal, pointsImaginary];
  }
};

function ComplexFunctionExplorerModel(attributes) {
  setAttributes(this, attributes, 
                ["f", "pixelsPerUnit", "originPixelLocation", "pixelsDimension", 
                 "domainCircle", "scaleMax", 
                 "colourScale"]);// e.g. f = colourScale maps to +255, -colourScale maps to 0.
  
  // attributes set by view: scaleF
    
  this.domainCircle.explorerModel = this; // link to parent
}

ComplexFunctionExplorerModel.prototype = {
    "minX": function() { return -(this.originPixelLocation[0]/this.pixelsPerUnit); }, 
    "minY": function() { return (this.originPixelLocation[1]-this.heightInPixels())/this.pixelsPerUnit; }, 
    
    "xRange": function() { return this.widthInPixels() / this.pixelsPerUnit; }, 
    "yRange": function() { return this.heightInPixels() / this.pixelsPerUnit; }, 
    
    "unitsPerPixel": function() {return 1.0/this.pixelsPerUnit;}, 
    
    "widthInPixels": function() { return this.pixelsDimension[0]; }, 
    
    "heightInPixels": function() { return this.pixelsDimension[1]; }, 
    
    "positionToComplexNumber": function(x, y) {
        return [(x-this.originPixelLocation[0])/this.pixelsPerUnit, 
                (this.originPixelLocation[1]-y)/this.pixelsPerUnit];
    }, 
  
    "writeToCanvasData": function(data) {
        var widthInPixels = this.widthInPixels();
        var heightInPixels = this.heightInPixels();
        var minX = this.minX();
        var xRange = this.xRange();
        var minY = this.minY();
        var yRange = this.yRange();
        var f = this.f;
        var colourScale = this.colourScale;
        var unitsPerPixel = this.unitsPerPixel();
        
        var x = minX;
        for (var i=0; i<widthInPixels; i++) {
            var y = minY;
            for (var j=heightInPixels-1; j >= 0; j--) { // note - canvas Y coords are upside down
                var z = f([x, y]);
                var k = (j*widthInPixels+i)*4;
                data[k] = (z[0]*colourScale+1.0)*128; // positive real = red
                data[k+1] = (z[1]*colourScale+1.0)*128; // positive imaginary = green
                data[k+2] = 0;
                data[k+3] = 255;
                y += unitsPerPixel;
            }
            x += unitsPerPixel;
        }
    }
};
  
function DomainCircleView (attributes) {
  setAttributes(this, attributes, 
                ["circleGraph", "centreHandle", "edgeHandle", "bigCircle", 
                 "polarGrid", "polarGridCoarse", 
                 "realPath", "imaginaryPath", 
                 "showCircleGraphCheckbox", "domainCircle"]);
  svgDraggable(this.centreHandle);
  svgDraggable(this.edgeHandle);
  
  var view = this;
  var domainCircle = this.domainCircle;
  
  this.centreHandle.on('svgDrag', function(event, x, y) {
      view.bigCircle.attr('cx', x);
      view.bigCircle.attr('cy', y);
      var edgePos = domainCircle.edgeHandlePosition;
      setTranslation(view.edgeHandle, x + edgePos[0], y + edgePos[1]);
      view.setModel();
      view.drawFunctionOnCircle();
    });
  
  this.edgeHandle.on('svgDrag', function(event, x, y) {
      view.setModel();
      view.bigCircle.attr('r', domainCircle.radius);
      view.drawFunctionOnCircle();
    });
  
  this.showCircleGraphCheckbox.on("change", function(event) {
      view.circleGraph.toggle(this.checked);
    });
  
  this.setModel();
}

DomainCircleView.prototype = {
  "setModel": function() {
    this.domainCircle.centreHandlePosition = getTranslation(this.centreHandle);
    this.domainCircle.edgeHandlePosition = minus(getTranslation(this.edgeHandle), 
                                                 this.domainCircle.centreHandlePosition);
    this.domainCircle.calculateRadius();
  }, 
  
  "drawFunctionOnCircle": function() {
    var pointArrays = this.domainCircle.functionGraphPointArrays();
    drawPointsPath(this.realPath, pointArrays[0]);
    drawPointsPath(this.imaginaryPath, pointArrays[1]);
    this.drawPolarGrid();
  }, 
  
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

function PolynomialFunction(attributes) {
    setAttributes(this, attributes, ["zeroes"]);
}

PolynomialFunction.prototype = {
    
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

function PolynomialFunctionView(attributes) {
    setAttributes(this, attributes, 
                  ["zeroHandles", "functionModel", "explorerModel"]);
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

var pxRegexp = /^([-0-9]+)px$/
  
function fromPx(pxExpression) {
  var pxMatch = pxRegexp.exec(pxExpression);
  if (pxMatch == null) {
    throw "Invalid px expression (expecting '<integer>px'): " + pxExpression;
  }
  return parseInt(pxMatch[1]);
}

PolynomialFunctionView.prototype = {
    "setNumberLabel" : function(i, handle) {
      var z = this.functionModel.zeroes[i];
      console.log("setNumberLabel, i = " + i + ", handle = " + handle + ", z = " + z);
      var formattedZ = formatComplexNumber(z[0], z[1], 2);
      $(handle).children(".zero-text").text(formattedZ);
    },    
    
    "setupHandle": function(i, handle) {
      var index = i;
      var explorerModel = this.explorerModel;
      var functionModel = this.functionModel;
      var view = this;
      this.setNumberLabel(index, handle[0]);
      var pointCircle = handle.children(".point-circle");
      var pointXOffset = fromPx(pointCircle.css("left")) + fromPx(pointCircle.css("width"))/2;
      var pointYOffset = fromPx(pointCircle.css("top")) + fromPx(pointCircle.css("height"))/2;
      handle.draggable({drag: 
                        function(event, ui) {
                          var x = ui.position.left + pointXOffset;
                          var y = ui.position.top + pointYOffset;
                          console.log("drag, x = " + x + ", y = " + y);
                          var z = explorerModel.positionToComplexNumber(x, y);
                          console.log("   z = " + z);
                          functionModel.zeroes[index] = z;
                          view.setNumberLabel(index, this);
                          functionModel.explorerView.functionChanging(true);
                        }, 
                        stop: 
                        function(event, ui) {
                          var x = ui.position.left + pointXOffset;
                          var y = ui.position.top + pointYOffset;
                          console.log("stop, x = " + x + ", y = " + y);
                          var z = explorerModel.positionToComplexNumber(x, y);
                          console.log("   z = " + z);
                          functionModel.zeroes[index] = z;
                          view.setNumberLabel(index, this);
                          functionModel.explorerView.functionChanged(false);
                        }})
        .css("cursor", "move");
    }
};
    

function CoordinatesView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", "showCoordinateGridCheckbox", "coordinates", "axes", "unitGrid", "fineGrid"]);
  this.coordinatesGroup = this.coordinates.children('[class="coordinates-group"]');
  var view = this;
  
  this.showCoordinateGridCheckbox.on("change", function(event) {
      view.coordinates.toggle(this.checked);
    });
  
  this.redraw();
}

var decimalNumberRegexp = /^(-|)([0-9]*|)([.][0-9]*|)$/

function reformatToPrecision(numberString, precision) {
  var match = decimalNumberRegexp.exec(numberString);
  var minusSign = match[1];
  var wholeNumber = match[2];
  var decimalPart = match[3].substring(0, precision+1);
  return minusSign + wholeNumber + decimalPart;
}

function formatComplexNumber(x, y, precision) {
  var showX = x != 0 || y == 0;
  var xString = showX ? reformatToPrecision(""+x, precision) : "";
  var showY = y != 1 & y != 0;
  var yString = y == -1 ? "-" : (showY ? reformatToPrecision(""+y, precision) : "");
  var showI = y != 0;
  var showPlus = x != 0 && y > 0 && showI;
  return xString + (showPlus ? "+" : "") + yString + (showI?"i" : "");
}

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
  
  "xCoordinateOffset": 3, 
  "yCoordinateOffset": 3, 
  
  "addCoordinatesText" : function(text, x, y) {
    var textElement = makeSvgElement("text", {class: "coordinates", x: x, y: y, fill: "#d0d0ff"})
    var textNode = document.createTextNode(text);
    textElement.appendChild(textNode);
    this.coordinatesGroup.append(textElement);
  }, 
  
  "horizontalPath": function (y) {
    var maxX = this.explorerModel.pixelsDimension[0];
    var yPixels = this.explorerModel.originPixelLocation[1] + this.explorerModel.pixelsPerUnit * y;
    return "M0," + yPixels + " L" + maxX + "," + yPixels;
  }, 
  
  "verticalPath": function (x) {
    var maxY = this.explorerModel.pixelsDimension[1];
    var xPixels = this.explorerModel.originPixelLocation[0] + this.explorerModel.pixelsPerUnit * x;
    return "M" + xPixels + ",0 L" + xPixels + "," + maxY;
  }, 
  
  "drawGrid": function(grid, spacing) {
    var origin = this.explorerModel.originPixelLocation;
    var dimension = this.explorerModel.pixelsDimension;
    var pixelsPerUnit = this.explorerModel.pixelsPerUnit;
    
    var minXIndex = Math.ceil((0-origin[0])/(pixelsPerUnit*spacing));
    var maxXIndex = Math.floor((dimension[0]-origin[0])/(pixelsPerUnit*spacing));
    var pathComponents = [];
    var componentsIndex = 0;
    for (var i=minXIndex; i <= maxXIndex; i++) {
      pathComponents[componentsIndex++] = this.verticalPath(i*spacing);
    }
    var xCoordinateOffset = this.xCoordinateOffset;
    var yCoordinateOffset = this.yCoordinateOffset;
    this.coordinatesGroup.empty();
    var minYIndex = Math.ceil((origin[1]-dimension[1])/(pixelsPerUnit*spacing));
    var maxYIndex = Math.floor(origin[1]/(pixelsPerUnit*spacing));
    for (var i=minYIndex; i <= maxYIndex; i++) {
      pathComponents[componentsIndex++] = this.horizontalPath(i*spacing);
      var yCoordinatePos = origin[1] + i*pixelsPerUnit - yCoordinateOffset;
      for (var j = minXIndex; j <= maxXIndex; j++) {
        var xCoordinatePos = origin[0] + j*pixelsPerUnit + xCoordinateOffset;
        this.addCoordinatesText(formatComplexNumber(j, -i, 2), xCoordinatePos, yCoordinatePos);
      }
    }
    grid.attr("d", pathComponents.join(" "));
  }, 
  
  "redraw": function() {
    var origin = this.explorerModel.originPixelLocation;
    var dimension = this.explorerModel.pixelsDimension;
    this.axes.attr("d", this.horizontalPath(0) + " " + this.verticalPath(0));
    
    this.drawGrid(this.unitGrid, 1.0);
    this.drawGrid(this.fineGrid, 0.1);
  }
};
  
function ComplexFunctionExplorerView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", "canvas", "domainCircleView", "coordinatesView", "scaleSlider", "scaleValueText", 
                 "colourScaleSlider", "colourScaleText", "complexFunction", "formula", 
                 "repaintContinuouslyCheckbox"]);
  this.complexFunction.explorerView = this;
  var view = this;

  function scaleChanging(event, ui) {
    view.fScaleUpdated(ui.value);
  }
  
  function scaleChanged(event, ui) {
    view.fScaleUpdated(ui.value);
  }
  
  this.scaleSlider.slider({"min": 0, "max": 100, "value": 50, 
        "orientation": "horizontal", 
                           "slide": scaleChanging, "change": scaleChanged
                          });
  
  function colourScaleChanged(event, ui) {
    view.colourScaleUpdated(ui.value, false);
  }
  
  function colourScaleChanging(event, ui) {
    view.colourScaleUpdated(ui.value, true);
  }
  
  this.colourScaleSlider.slider({"min": 0, "max": 100, "value": 50,
        "orientation": "horizontal", "slide": colourScaleChanging, "change": colourScaleChanged});
  
  this.setScaleFFromView(this.scaleSlider.slider("value"));
  this.setColourScaleFromView(this.colourScaleSlider.slider("value"));
  
  this.repaintContinuouslyCheckbox.on("change", function(event) {
    view.repaintContinuously = this.checked;
  });
  this.repaintContinuously = this.repaintContinuouslyCheckbox.is(":checked");
  
  this.functionChanged(false);
}

ComplexFunctionExplorerView.prototype = {
  
  "fScaleUpdated": function(value) {
    this.setScaleFFromView(value);
    this.drawFunctionGraphs();
  }, 
  
  "colourScaleUpdated": function(value, changing) {
    this.setColourScaleFromView(value);
    this.drawDomainColouring(changing);
  }, 
  
  "functionChanged": function(changing) {
    this.formula.text(this.complexFunction.getFormula());
    this.drawDomainColouring(changing);
    this.drawFunctionGraphs(changing);
  },    
  
  "functionChanging": function() {
    this.functionChanged(true);
  }, 
  
  "setScaleFFromView": function(value) {
    this.explorerModel.scaleF = 0.5 * Math.pow(1.08, value-50);
    this.scaleValueText.text(Math.round(this.explorerModel.scaleF*100)/100.0);
  }, 
  
  "setColourScaleFromView": function(value) {
    this.explorerModel.colourScale = 1.0 * Math.pow(1.2, value-50);
    this.colourScaleText.text(Math.round(this.explorerModel.colourScale*100)/100.0);
  }, 

  "drawFunctionGraphs": function() {
    this.domainCircleView.drawFunctionOnCircle();
  }, 
  
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
