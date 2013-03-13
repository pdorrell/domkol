$(document).ready(function(){
    var ctx = $('#domain')[0].getContext("2d");
    drawOnCanvas(ctx);
  });

function drawOnCanvas(ctx) {
  drawTheCircle(ctx);
}

function drawTheCircle(ctx) {
  ctx.beginPath();
  ctx.arc(75, 75, 30, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
}
