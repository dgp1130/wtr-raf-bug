import { HydroActiveComponent } from '../../hydroactive-component.js';
import { ComponentRef, ElementRef } from 'hydroactive';

/** Automatically increments the count over time. */
const AutoCounter = class extends HydroActiveComponent {
  override hydrate(): void {
    const comp = ComponentRef._from(ElementRef.from(this));
    comp.live('span', Number);
  }
};

customElements.define('auto-counter', AutoCounter);

declare global {
  interface HTMLElementTagNameMap {
    'auto-counter': InstanceType<typeof AutoCounter>;
  }
}
