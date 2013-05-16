$(document).ready(function(){
  
  var controlDialogElement = new DOMKOL.ControlDialogElement($("#control-dialog"));
  
  var controlDialog = new DOMKOL.ControlDialog(controlDialogElement);
  
  function exponential(z) {
    var realFactor = Math.exp(z[0]);
    var cos = Math.cos(z[1]);
    var sin = Math.sin(z[1]);
    return [realFactor*cos, realFactor*sin];
  }
  
  var exponentialFunction = new DOMKOL.ComplexFunction(exponential, "exp(x)");

  var explorerView = DOMKOL.createExplorerView($("#domkol"), exponentialFunction, controlDialog.values, 
                                               80, [250, 350], [800, 800], 150);
  
  controlDialog.connect(explorerView);
});
