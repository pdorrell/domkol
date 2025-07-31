$(document).ready(function(){

  /** Object representing the control Dialog DOM Tree within the specified div element. */
  var controlDialogElements = new DOMKOL.ControlDialogElements($("#control-dialog"));
  
  /** The Control Dialog itself (as an object which can be connected to the Complex Plane & graph view)*/
  var controlDialog = new DOMKOL.ControlDialog(controlDialogElements);
  
  /** Add additional instructions about the function to the control dialog */
  controlDialog.addFunctionInstructions("Drag the blue numbers to change the zeroes of the cubic polynomial " + 
                                        "(initially they are all located on the origin).");

  /** Initial complex zeroes for cubic polynomial, i.e. 0+0i,0+0i,0+0i. */
  var zeroes = [[0, 0], [0, 0], [0, 0]];
  /** Object representing the cubic polynomial*/
  var polynomialFunction = new DOMKOL.PolynomialFunction(zeroes);

  /** Explorer view - consisting of complex plane, coordinates and circular graph, 
      (and to which can be added handles for controlling values of the zeroes of the polynomial) */
  var explorerView = DOMKOL.createExplorerView($("#domkol"),     // div element in which to insert the complex plane view
                                               polynomialFunction, // the cubic polynomial
                                               controlDialog.values, // initial values for the explorer view settings 
                                               240, // pixels per unit
                                               [280, 280], // pixel location of complex origin
                                               [560, 560], // width * height in pixels of complex plane
                                               150); // initial radius in pixels of the circle
  
  /** Create draggable "number handles" to control values of the zeroes of the polynomial */
  var numZeroes = zeroes.length;
  for (i=numZeroes-1; i >= 0; i--) { // create in reverse order, because last one created is first one to be dragged
    var zeroHandle = explorerView.createComplexNumberHandle(i, zeroes[i]);
    // When the dragged number changes, update the corresponding zero in the polynomial
    $(zeroHandle).on("numberChanged", 
                     function(event, index, number, changing) {
                       polynomialFunction.updateZero(index, number, changing);
                     });
  }
  
  /** Connect the control dialog so that it actually controls the explorer view */
  controlDialog.connect(explorerView);
});
