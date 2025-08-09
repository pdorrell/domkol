import { makeAutoObservable } from 'mobx';
import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { ExponentialFunction } from '@/stores/ExponentialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import { Complex, complex } from '@/utils/complex';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { pageModels } from './DomainPageModel';

export class Domkol {
  selectedPageIndex: number = 0;
  currentFunction: PolynomialFunction | ExponentialFunction;
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  domainColoringRenderer: DomainColoringRenderer;
  isZeroChanging: boolean = false;

  constructor() {
    makeAutoObservable(this);

    // Initialize based on default page model (cubic polynomial)
    const initialPageModel = pageModels[0];

    this.currentFunction = new PolynomialFunction(initialPageModel.initialZeroes);
    this.domainCircle = new DomainCircle(complex(0, 0), initialPageModel.initialCircleRadius);
    this.functionGraphRenderer = new FunctionGraphRenderer();
    this.domainColoringRenderer = new DomainColoringRenderer();
  }

  get currentPageModel() {
    return pageModels[this.selectedPageIndex];
  }

  get viewport(): ViewportConfig {
    return {
      originPixelLocation: this.currentPageModel.originPixelLocation,
      pixelsPerUnit: this.currentPageModel.pixelsPerUnit,
      width: this.currentPageModel.canvasWidth,
      height: this.currentPageModel.canvasHeight
    };
  }

  get showNumberHandles(): boolean {
    return this.currentFunction instanceof PolynomialFunction;
  }

  handlePageChange(index: number): void {
    this.selectedPageIndex = index;
    const newPageModel = pageModels[index];

    // Create new function instance based on type
    if (newPageModel.functionType === 'exponential') {
      this.currentFunction = new ExponentialFunction();
    } else {
      this.currentFunction = new PolynomialFunction(newPageModel.initialZeroes);
    }

    // Reset domain circle with new radius
    this.domainCircle = new DomainCircle(complex(0, 0), newPageModel.initialCircleRadius);
    this.isZeroChanging = false;
  }

  handleZeroChange = (index: number, newValue: Complex, changing: boolean): void => {
    if (this.currentFunction instanceof PolynomialFunction) {
      this.currentFunction.updateZero(index, newValue, changing);
      this.isZeroChanging = changing;
    }
  }

}
