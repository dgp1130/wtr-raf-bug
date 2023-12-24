import { UiScheduler } from '../../signals/schedulers/ui-scheduler.js';

/** Automatically increments the count over time. */
class AutoCounter extends HTMLElement {
  private readonly scheduler = UiScheduler.from();
  private disposeEffect!: () => void;

  connectedCallback(): void {
    this.disposeEffect = this.scheduler.schedule(() => { });
  }

  disconnectedCallback(): void {
    this.disposeEffect();
  }

  public stable(): Promise<void> {
    return this.scheduler.stable();
  }
};

customElements.define('auto-counter', AutoCounter);

declare global {
  interface HTMLElementTagNameMap {
    'auto-counter': InstanceType<typeof AutoCounter>;
  }
}
