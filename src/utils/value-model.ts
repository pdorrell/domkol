import { makeAutoObservable } from 'mobx';

/**
 * Generic model for a value that can be updated through UI components
 */
export class ValueModel<T> {

  value: T;

  constructor(initialValue: T, skipMobx = false) {
    this.value = initialValue;

    // Only call makeAutoObservable if this is not a subclass
    if (!skipMobx) {
      makeAutoObservable(this);
    }
  }

  /**
   * Set a new value
   */
  set(newValue: T): void {
    this.value = newValue;
  }

  /**
   * Update value with changing state (for drag handles)
   */
  update(newValue: T, _changing: boolean): void {
    this.value = newValue;
    // The changing parameter is available for subclasses to override
    // if they need to track drag state
  }
}
