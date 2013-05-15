$(document).ready(function(){
  
  var controlDialogElement = new ControlDialogElement($("#control-dialog"));
  
  var controlDialog = new ControlDialog(controlDialogElement);
  
  controlDialog.addFunctionInstructions("Drag the blue numbers to change the zeroes of the cubic polynomial " + 
                                        "(initially they are all located on the origin).");

  var zeroes = [[0, 0], [0, 0], [0, 0]];
  var polynomialFunction = new PolynomialFunction(zeroes);

  var explorerView = createExplorerView($("#domkol"), polynomialFunction, controlDialog.values, 
                                        240, [280, 280], [560, 560], 150);
  
  var numZeroes = zeroes.length;
  for (i=numZeroes-1; i >= 0; i--) { // create in reverse order, because last one created is first one to be dragged
    var zeroHandle = explorerView.createNumberHandle(i, zeroes[i]);
    $(zeroHandle).on("numberChanged", 
                     function(event, index, number, changing) {
                       polynomialFunction.updateZero(index, number, changing);
                     });
  }
  
  controlDialog.connect(explorerView);
});
