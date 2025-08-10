import { makeObservables } from '@/utils/mobx-helpers';

/**
 * Generic model for a value that can be updated through UI components
 */

export interface ValueModelInterface<T> {
  value: T;
  set(newValue: T): void;
}

export class ValueModel<T> implements ValueModelInterface<T> {

  value: T;

  constructor(initialValue: T, skipMobx = false) {
    this.value = initialValue;

    // Only setup observables if this is not a subclass
    if (!skipMobx) {
      makeObservables(this, {
        observable: 'value',
        action: 'set update'
      });
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
