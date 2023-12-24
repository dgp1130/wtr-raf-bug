/** @fileoverview Defines symbols related to component definition. */

import { ComponentRef } from './component-ref.js';
import { ElementRef } from './element-ref.js';
import { HydroActiveComponent } from './hydroactive-component.js';

/** The type of the lifecycle hook invoked when the component hydrates. */
export type HydrateLifecycle = (host: ComponentRef) => void;

/**
 * Defines a component of the given tag name with the provided hydration
 * callback.
 */
export function defineComponent(tagName: string, hydrate: HydrateLifecycle):
    Class<HydroActiveComponent> {
  const Component = class extends HydroActiveComponent {
    override hydrate(): void {
      hydrate(ComponentRef._from(ElementRef.from(this)));
    }
  };

  customElements.define(tagName, Component);

  return Component;
}

/**
 * Analogous to `Class<T>` in Java. Represents the class object of the given
 * instance type.
 */
type Class<Instance> = { new(): Instance };
