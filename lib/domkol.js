$(document).ready(function(){
    var ctx = $('#domain')[0].getContext("2d");
    drawOnCanvas(ctx);
  });

function drawOnCanvas(ctx) {
  //drawTheCircle(ctx);
  drawColors(ctx);
}

function f(z) {
  var a = z[0];
  var b = z[1];
  return [a*a - b*b, 2*a*b];
}

function drawColors(ctx) {
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
