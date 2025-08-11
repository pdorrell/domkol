import { PolynomialFunction } from '@/stores/PolynomialFunction';
import { ExponentialFunction } from '@/stores/ExponentialFunction';
import { DomainCircle } from '@/stores/DomainCircle';
import { FunctionGraphRenderer } from '@/stores/FunctionGraphRenderer';
import { DomainColoringRenderer } from '@/stores/DomainColoringRenderer';
import { Complex, complex } from '@/utils/complex';
import { ViewportConfig } from '@/utils/coordinateTransforms';
import { ValueModel } from '@/utils/value-model';
import { makeObservables } from '@/utils/mobx-helpers';
import { pageModels } from './DomainPageModel';

export class Domkol {
  selectedPageIndex: number = 0;
  currentFunction: PolynomialFunction | ExponentialFunction;
  domainCircle: DomainCircle;
  functionGraphRenderer: FunctionGraphRenderer;
  domainColoringRenderer: DomainColoringRenderer;
  isZeroChanging: boolean = false;
  showAbout: ValueModel<boolean>;

  private wiggleTimer: number | null = null;

  constructor() {
    // Initialize based on default page model (cubic polynomial)
    const initialPageModel = pageModels[0];

    this.currentFunction = new PolynomialFunction(initialPageModel.initialZeroes);
    this.domainCircle = new DomainCircle(complex(0, 0), initialPageModel.initialCircleRadius);
    this.functionGraphRenderer = new FunctionGraphRenderer();
    this.domainColoringRenderer = new DomainColoringRenderer();
    this.showAbout = new ValueModel(false);

    makeObservables(this, {
      observable: 'selectedPageIndex currentFunction domainCircle functionGraphRenderer domainColoringRenderer isZeroChanging showAbout',
      computed: 'currentPageModel viewport showNumberHandles',
      action: 'handlePageChange startWiggleTimer stopWiggleTimer'
    });

    // Start the wiggle animation timer
    this.startWiggleTimer();
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


  startWiggleTimer(): void {
    if (this.wiggleTimer !== null) {
      this.stopWiggleTimer();
    }

    this.wiggleTimer = window.setInterval(() => {
      this.functionGraphRenderer.wiggleOneStep();
    }, 50);
  }

  stopWiggleTimer(): void {
    if (this.wiggleTimer !== null) {
      window.clearInterval(this.wiggleTimer);
      this.wiggleTimer = null;
    }
  }

  // Clean up timer when the instance is destroyed
  destroy(): void {
    this.stopWiggleTimer();
  }

}
