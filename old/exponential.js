$(document).ready(function(){
  
  /** Object representing the control Dialog DOM Tree within the specified div element. */
  var controlDialogElements = new DOMKOL.ControlDialogElements($("#control-dialog"));
  
  /** The Control Dialog itself (as an object which can be connected to the Complex Plane & graph view)*/
  var controlDialog = new DOMKOL.ControlDialog(controlDialogElements);
  
  /** Complex exponential function, where complex numbers are represented as an array of two floats */
  function exponential(z) {
    var realFactor = Math.exp(z[0]);
    var cos = Math.cos(z[1]);
    var sin = Math.sin(z[1]);
    return [realFactor*cos, realFactor*sin];
  }
  
  /** Object representing the exponential function */
  var exponentialFunction = new DOMKOL.ComplexFunction(exponential, "exp(x)");

  /** Explorer view - consisting of complex plane, coordinates and circular graph */
  var explorerView = DOMKOL.createExplorerView($("#domkol"), // div element in which to insert the complex plane view
                                               exponentialFunction, // the exponential function
                                               controlDialog.values, // initial values for the explorer view settings
                                               80, // pixels per unit
                                               [250, 350], // pixel location of complex origin
                                               [800, 800], // width * height in pixels of complex plane
                                               150); // initial radius in pixels of the circle
  
  /** Connect the control dialog so that it actually controls the explorer view */
  controlDialog.connect(explorerView);
});
