$(document).ready(function(){
    readyCanvas();
    readyCircleAndHandles();
  });

function readyCanvas() {
  var canvas =  $('#domkol-canvas')[0];
  var ctx = $('#domkol-canvas')[0].getContext("2d");
  drawOnCanvas(ctx);
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
        

function readyCircleAndHandles() {
  var centreHandle = $('#centre-handle');
  var edgeHandle = $('#edge-handle');
  var bigCircle = $("#big-circle");
  svgDraggable(centreHandle);
  svgDraggable(edgeHandle);
  
  bigCircle.attr('edge-x', edgeHandle.attr('cx') - bigCircle.attr('cx'));
  bigCircle.attr('edge-y', edgeHandle.attr('cy') - bigCircle.attr('cy'));

  centreHandle.on('svgDrag', function(event, x, y) {
      bigCircle.attr('cx', x);
      bigCircle.attr('cy', y);
      var edgeX = parseInt(bigCircle.attr('edge-x'));
      var edgeY = parseInt(bigCircle.attr('edge-y'));
      edgeHandle.attr('cx', x + edgeX);
      edgeHandle.attr('cy', y + edgeY);
    });
  
  edgeHandle.on('svgDrag', function(event, x, y) {
      var cx = bigCircle.attr('cx');
      var cy = bigCircle.attr('cy');
      bigCircle.attr('edge-x', x-cx);
      bigCircle.attr('edge-y', y-cy);
    });
}

function drawOnCanvas(ctx) {
  //drawTheCircle(ctx);
  drawColors(ctx, cube);
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

function drawColors(ctx, f) {
  var imageData = ctx.createImageData(512, 512);
  var data = imageData.data;
  for (var i=0; i<512; i++) {
    for (var j=0; j<512; j++) {
      var x = (i-256)/256;
      var y = (j-256)/256;
      var z = f([x, y]);
      var k = (i*512+j)*4;
      data[k] = (z[0]+1.0)*128;
      data[k+1] = (z[1]+1.0)*128;
      data[k+2] = 0;
      data[k+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawTheCircle(ctx) {
  ctx.beginPath();
  ctx.arc(75, 75, 30, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
}
