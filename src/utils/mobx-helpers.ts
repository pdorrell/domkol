import { makeObservable, observable, action, computed } from 'mobx';

/**
 * Helper function to make multiple observables with a more concise syntax
 * @param target The object to make observable
 * @param config Configuration object with space-separated property names
 */
export function makeObservables<T extends object>(
  target: T,
  config: {
    observable?: string;
    action?: string;
    computed?: string;
  }
): void {
  const annotations: Record<string, any> = {};

  // Parse observable properties
  if (config.observable) {
    config.observable.split(/\s+/).forEach(prop => {
      if (prop) {
        annotations[prop] = observable;
      }
    });
  }

  // Parse action properties
  if (config.action) {
    config.action.split(/\s+/).forEach(prop => {
      if (prop) {
        annotations[prop] = action;
      }
    });
  }

  // Parse computed properties
  if (config.computed) {
    config.computed.split(/\s+/).forEach(prop => {
      if (prop) {
        annotations[prop] = computed;
      }
    });
  }

  makeObservable(target, annotations);
}
