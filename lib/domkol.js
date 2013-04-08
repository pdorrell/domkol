$(document).ready(function(){
    readyCanvas();
    readyHandle();
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
        

function readyHandle() {
  var handle = $('#centre-handle').draggable()
    .bind('mousedown', function(event){
        // console.log("mousedown, event = " + objectToString(event, 20));
        var eventTarget = event.target;
        var cx = eventTarget.getAttribute("cx");
        var cy = eventTarget.getAttribute("cy");
        $(event.target).data("offset", [cx-event.pageX, cy-event.pageY]);
        // bring target to front
        $(event.target.parentElement).append( event.target );
      })
    .bind('drag', function(event, ui){
        var offset = $(event.target).data("offset");
        //console.log("event page X = " + event.pageX + ", Y = " + event.pageY);
        event.target.setAttribute('cx', event.pageX + offset[0]);
        event.target.setAttribute('cy', event.pageY + offset[1]);
    });
  $('#test-handle').draggable();
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
