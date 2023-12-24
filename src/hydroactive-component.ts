/** Abstract base class for all HydroActive components. */
export abstract class HydroActiveComponent extends HTMLElement {
  /** Listeners to invoke when connected to the DOM. */
  readonly #connectListeners: Array<() => void> = [];

  /** Listeners to invoke when disconnected from the DOM. */
  readonly #disconnectListeners: Array<() => void> = [];

  /** TODO */
  public stable!: () => Promise<void>;

  /** User-defined lifecycle hook invoked on hydration. */
  protected abstract hydrate(): void;

  public /* internal */ _registerLifecycleHooks({
    onConnect,
    onDisconnect,
    stable,
  }: {
    onConnect?: () => void,
    onDisconnect?: () => void,
    stable: () => Promise<void>,
  }): void {
    if (onConnect) this.#connectListeners.push(onConnect);
    if (onDisconnect) this.#disconnectListeners.push(onDisconnect);
    this.stable = stable;
  }

  connectedCallback(): void {
    // The "connect" event triggers _before_ the "hydrate" event when they
    // happen simultaneously. Listeners should know to invoke connect callbacks
    // discovered post-connection time, such as during hydration.
    for (const listener of this.#connectListeners) listener();

    this.hydrate();
  }

  disconnectedCallback(): void {
    for (const listener of this.#disconnectListeners) listener();
  }
}
