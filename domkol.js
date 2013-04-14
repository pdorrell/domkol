$(document).ready(function(){
    var domainCircle = new DomainCircle({circumferenceIncrementInPixels: 1});
    
    var explorerModel = new ComplexFunctionExplorerModel({ f: cube, 
                                                           pixelsPerUnit: 256, 
                                                           originPixelLocation: [256, 256], 
                                                           pixelsDimension: [512, 512], 
                                                           maxColourValue: 1.0,
                                                           scaleMax: 100, 
                                                           domainCircle: domainCircle });

    var domainCircleView = new DomainCircleView({circleGraph: $('#circle-graph'), 
                                                 centreHandle: $('#centre-handle'), 
                                                 edgeHandle: $('#edge-handle'), 
                                                 bigCircle: $("#big-circle"), 
                                                 polarGrid: $("#polar-grid"), 
                                                 realPath: $("#real-path"), 
                                                 imaginaryPath: $("#imaginary-path"), 
                                                 showCircleGraphCheckbox: $("#show-circle-graph-checkbox"), 
                                                 domainCircle: explorerModel.domainCircle});
  
    var explorerView = new ComplexFunctionExplorerView({explorerModel: explorerModel, 
                                                        canvas: $('#domkol-canvas')[0], 
                                                        domainCircleView: domainCircleView, 
                                                        scaleSlider: $("#scale-slider"), 
                                                        scaleValueText: $("#scale-value"), 
                                                        maxColourValueSlider: $("#max-colour-value-slider"), 
                                                        maxColourValueText: $("#max-colour-value"), 
      });
    
    readyZeroHandles();
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

function svgDraggable(handle) {
  handle.draggable()
    .css('cursor', 'move')
    .bind('mousedown', function(event){
        var handle = event.target;
        var cx = handle.getAttribute("cx");
        var cy = handle.getAttribute("cy");
        $(event.target).data("offset", [cx - event.pageX, cy - event.pageY]);
        $(handle).trigger('startSvgDrag', [cx, cy]);
      })
    .bind('drag', function(event, ui){
        var handle = event.target;
        var offset = $(handle).data("offset");
        var x = event.pageX + offset[0];
        var y = event.pageY + offset[1];
        handle.setAttribute('cx', x);
        handle.setAttribute('cy', y);
        $(handle).trigger('svgDrag', [x, y]);
    });
}

var translateRegexp = /^translate[(]([-0-9.]+)[ ]+([-0-9.]+)[)]$/;

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

function svgDraggableTranslatee(handle) {
  var translateRegexp = /^translate[(]([-0-9.]+)[ ]+([-0-9.]+)[)]$/;
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
    });
}

function readyZeroHandles() {
  svgDraggableTranslatee($("#zero1-handle"));
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
    var scaleFPixels = explorerModel.scaleF/unitsPerPixel;
    for (var i=0; i<numSteps+1; i++) {
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var px = cx + r * sinTheta;
      var py = cy + r * cosTheta;
      var x = minX + px * unitsPerPixel;
      var y = minY + py * unitsPerPixel;
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
                 "maxColourValue"]);// e.g. f = maxColourValue maps to +255, -maxColourValue maps to 0.
  
  // attributes set by view: scaleF
    
  this.domainCircle.explorerModel = this; // link to parent
}

ComplexFunctionExplorerModel.prototype = {
  "minX": function() { return -(this.originPixelLocation[0]/this.pixelsPerUnit); }, 
  "minY": function() { return -(this.originPixelLocation[1]/this.pixelsPerUnit); }, 
  
  "xRange": function() { return this.widthInPixels() / this.pixelsPerUnit; }, 
  "yRange": function() { return this.heightInPixels() / this.pixelsPerUnit; }, 
  
  "unitsPerPixel": function() {return 1.0/this.pixelsPerUnit;}, 
  
  "widthInPixels": function() { return this.pixelsDimension[0]; }, 

  "heightInPixels": function() { return this.pixelsDimension[1]; }, 
  
  "writeToCanvasData": function(data) {
    var widthInPixels = this.widthInPixels();
    var heightInPixels = this.heightInPixels();
    var minX = this.minX();
    var xRange = this.xRange();
    var minY = this.minY();
    var yRange = this.yRange();
    var f = this.f;
    var colorFactor = 1.0/this.maxColourValue;
    var unitsPerPixel = this.unitsPerPixel();
    
    var x = minX;
    for (var i=0; i<widthInPixels; i++) {
      var y = minY;
      for (var j=0; j<heightInPixels; j++) {
        var z = f([x, y]);
        var k = (i*widthInPixels+j)*4;
        data[k] = (z[0]*colorFactor+1.0)*128;
        data[k+1] = (z[1]*colorFactor+1.0)*128;
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
                ["circleGraph", "centreHandle", "edgeHandle", "bigCircle", "polarGrid", 
                 "realPath", "imaginaryPath", 
                 "showCircleGraphCheckbox", "domainCircle"]);
  svgDraggableTranslatee(this.centreHandle);
  svgDraggableTranslatee(this.edgeHandle);
  
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
    var numRadialLines = 24;
    var thetaIncrement = Math.PI * 2 / numRadialLines;
    var pathComponents = [];
    var pathIndex = 0;
    var centrePos = this.domainCircle.centreHandlePosition;
    var centreX = centrePos[0];
    var centreY = centrePos[1];
    var moveToCentrePathComponent = "M" + centreX + "," + centreY;
    var gridRadius = this.domainCircle.radius * 2;
    for (var i = 0; i<numRadialLines; i++) {
      var lineEndX = centreX + gridRadius * Math.sin(theta);
      var lineEndY = centreY + gridRadius * Math.cos(theta);
      pathComponents[pathIndex++] = moveToCentrePathComponent + " " + "L" + lineEndX + "," + lineEndY;
      theta += thetaIncrement;
    }
    var radiusIncrement = 0.2 * this.domainCircle.radius;
    for (var gridCircleRadius = radiusIncrement; gridCircleRadius <= gridRadius; gridCircleRadius += radiusIncrement) {
      pathComponents[pathIndex++] = pathCircleComponent (centreX, centreY, gridCircleRadius);
    }
    
    this.polarGrid.attr("d", pathComponents.join(" "));
  }

};
  
function ComplexFunctionExplorerView(attributes) {
  setAttributes(this, attributes, 
                ["explorerModel", "canvas", "domainCircleView", "scaleSlider", "scaleValueText", 
                 "maxColourValueSlider", "maxColourValueText"]);
  
  var view = this;

  function scaleChanged(event, ui) {
    view.fScaleUpdated(ui.value);
  }
  
  this.scaleSlider.slider({"min": 0, "max": 100, "value": 50, 
        "orientation": "horizontal", "slide": scaleChanged, "change": scaleChanged});
  
  function maxColourValueChanged(event, ui) {
    view.maxColourValueUpdated(ui.value);
  }
  
  this.maxColourValueSlider.slider({"min": 0, "max": 100, "value": 50,
        "orientation": "horizontal", "slide": maxColourValueChanged, "change": maxColourValueChanged});
  
  this.scaleSlider.on("slide", function(event, ui) { view.fScaleUpdated(ui.value);} );
  this.scaleSlider.on("change", function(event, ui) { view.fScaleUpdated(ui.value);} );
  
  this.setScaleFFromView(this.scaleSlider.slider("value"));
  this.setMaxColourValueFromView(this.maxColourValueSlider.slider("value"));
  
  this.drawDomainColouring();
  this.drawFunctionGraphs();
}

ComplexFunctionExplorerView.prototype = {
  
  "fScaleUpdated": function(value) {
    this.setScaleFFromView(value);
    this.drawFunctionGraphs();
  }, 
  
  "maxColourValueUpdated": function(value) {
    this.setMaxColourValueFromView(value);
    this.drawDomainColouring();
  }, 
  
  "setScaleFFromView": function(value) {
    this.explorerModel.scaleF = 0.5 * Math.pow(1.08, value-50);
    this.scaleValueText.text(Math.round(this.explorerModel.scaleF*100)/100.0);
  }, 
  
  "setMaxColourValueFromView": function(value) {
    this.explorerModel.maxColourValue = 1.0 * Math.pow(1.2, value-50);
    this.maxColourValueText.text(Math.round(this.explorerModel.maxColourValue*100)/100.0);
  }, 

  "drawFunctionGraphs": function() {
    this.domainCircleView.drawFunctionOnCircle();
  }, 
  
  "drawDomainColouring" : function() {
    var ctx = this.canvas.getContext("2d");
    var imageData = ctx.createImageData(this.explorerModel.widthInPixels(), 
                                        this.explorerModel.heightInPixels());
    this.explorerModel.writeToCanvasData(imageData.data);
    ctx.putImageData(imageData, 0, 0);
  }
    
}
