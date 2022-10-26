import { HydratableElement, live } from '../lib/hydrator.js';

class IslandCounter extends HydratableElement {
  @live('span', Number)
  private count!: number;

  protected override hydrate(): void {
    this.listen('#decrement', 'click', () => this.count--);
    (this.shadowRoot!.querySelector('#decrement')! as HTMLButtonElement).disabled = false;

    this.listen('#increment', 'click', () => this.count++);
    (this.shadowRoot!.querySelector('#increment')! as HTMLButtonElement).disabled = false;
  }
}

customElements.define('island-counter', IslandCounter);
