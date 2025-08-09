import { makeAutoObservable } from 'mobx';

/**
 * Generic model for a value that can be updated through UI components
 */
export class ValueModel<T> {
  tooltip: string;

  constructor(initialValue: T) {
    this.value = initialValue;

    makeAutoObservable(this);
  }

  /**
   * Set a new value
   */
  set(newValue: T): void {
    this.value = newValue;
  }
}
