$(document).ready(function(){
    var domainCircle = new DomainCircle({circumferenceIncrementInPixels: 1});
    
    var explorerModel = new ComplexFunctionExplorerModel({ f: cube, 
                                                           pixelsPerUnit: 256, 
                                                           originPixelLocation: [256, 256], 
                                                           pixelsDimension: [512, 512], 
                                                           maxColourValue: 1.0,
                                                           scaleMax: 100, 
                                                           domainCircle: domainCircle });
    readyCanvas(explorerModel);
    readyCircleAndHandles(explorerModel);
  });

function readyCanvas(explorerModel) {
  var canvas =  $('#domkol-canvas')[0];
  var ctx = $('#domkol-canvas')[0].getContext("2d");
  drawOnCanvas(ctx, explorerModel);
} 

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
        // bring target to front
        $(event.target.parentElement).append( event.target );
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

function drawFunctionOnCircle(explorerModel, 
                              realPath, imaginaryPath) {
  var pointArrays = explorerModel.domainCircle.functionGraphPointArrays();
  drawPointsPath(realPath, pointArrays[0]);
  drawPointsPath(imaginaryPath, pointArrays[1]);
}

function readyCircleAndHandles(explorerModel) {
  var centreHandle = $('#centre-handle');
  var edgeHandle = $('#edge-handle');
  var bigCircle = $("#big-circle");
  var realPath = $("#real-path");
  var imaginaryPath = $("#imaginary-path");
  var scaleSlider = $("#scale-slider");
  var scaleValueText = $("#scale-value");
  
  var domainCircle = explorerModel.domainCircle;
  
  function setDomainCircleFromView() {
    var centreX = parseInt(bigCircle.attr('cx'));
    var centreY = parseInt(bigCircle.attr('cy'));
    domainCircle.centreHandlePosition = [centreX, centreY];
    var edgeX = edgeHandle.attr('cx');
    var edgeY = edgeHandle.attr('cy');
    domainCircle.edgeHandlePosition = [edgeX-centreX, edgeY-centreY]; // relative position
    domainCircle.calculateRadius();
  }    
  
  function setScaleFFromView() {
    var scaleValue = scaleSlider.slider("value");
    explorerModel.scaleF = 0.5 * Math.pow(1.08, scaleValue-50);
    scaleValueText.text(Math.round(explorerModel.scaleF*100)/100.0);
  }    

  function drawFOnCircle() {
    drawFunctionOnCircle(explorerModel, realPath, imaginaryPath);
  }
  
  svgDraggable(centreHandle);
  svgDraggable(edgeHandle);
  
  centreHandle.on('svgDrag', function(event, x, y) {
      bigCircle.attr('cx', x);
      bigCircle.attr('cy', y);
      var edgePos = domainCircle.edgeHandlePosition;
      edgeHandle.attr('cx', x + edgePos[0]);
      edgeHandle.attr('cy', y + edgePos[1]);
      setDomainCircleFromView();
      drawFOnCircle();
    });
  
  edgeHandle.on('svgDrag', function(event, x, y) {
      setDomainCircleFromView();
      bigCircle.attr('r', domainCircle.radius);
      drawFOnCircle();
    });
  
  scaleSlider.slider({"min": 0, "max": 100, "value": 50, 
        "orientation": "horizontal", 
        "slide": fScaleUpdated, "change": fScaleUpdated});
  
  function fScaleUpdated() {
    setScaleFFromView();
    drawFOnCircle();
  }
  
  setScaleFFromView();
  setDomainCircleFromView();
  drawFOnCircle();
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

function drawOnCanvas(ctx, explorerModel) {
  var imageData = ctx.createImageData(explorerModel.widthInPixels(), explorerModel.heightInPixels());
  explorerModel.writeToCanvasData(imageData.data);
  ctx.putImageData(imageData, 0, 0);
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
}

DomainCircle.prototype = {
  calculateRadius: function() {
    var edgeX = this.edgeHandlePosition[0];
    var edgeY = this.edgeHandlePosition[1];
    this.radius = Math.sqrt(edgeX*edgeX + edgeY*edgeY);
  }, 
  
  // return real & imaginary paths as arrays of points
  functionGraphPointArrays: function () {
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
}

function ComplexFunctionExplorerModel(attributes) {
  setAttributes(this, attributes, 
                ["f", "pixelsPerUnit", "originPixelLocation", "pixelsDimension", 
                 "domainCircle", "scaleMax", 
                 "maxColourValue"])// e.g. f = maxColourValue maps to +255, -maxColourValue maps to 0.
    this.domainCircle.explorerModel = this; // link to parent
}

ComplexFunctionExplorerModel.prototype = {
  minX: function() { return -(this.originPixelLocation[0]/this.pixelsPerUnit); }, 
  minY: function() { return -(this.originPixelLocation[1]/this.pixelsPerUnit); }, 
  
  xRange: function() { return this.widthInPixels() / this.pixelsPerUnit; }, 
  yRange: function() { return this.heightInPixels() / this.pixelsPerUnit; }, 
  
  unitsPerPixel: function() {return 1.0/this.pixelsPerUnit;}, 
  
  widthInPixels: function() { return this.pixelsDimension[0]; }, 

  heightInPixels: function() { return this.pixelsDimension[1]; }, 
  
  writeToCanvasData: function(data) {
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
}