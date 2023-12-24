import { Action, CancelAction, Scheduler } from './scheduler.js';

// DEBUG
const raf = requestAnimationFrame;
globalThis.requestAnimationFrame = function (callback: FrameRequestCallback): number {
  // return setTimeout(callback, 16 /* ms */);
  const handle = raf((...args) => {
    console.log(`callback - ${handle} @ ${new Date().getTime()}`);
    return callback(...args);
  });
  console.log(`requestAnimationFrame - ${handle} @ ${new Date().getTime()}`);
  return handle;
}
const caf = cancelAnimationFrame;
globalThis.cancelAnimationFrame = function (handle: number): void {
  console.log(`clearAnimationFrame - ${handle} @ ${new Date().getTime()}`);
  // clearTimeout(handle);
  return caf(handle);
}

/**
 * A {@link Scheduler} implementation which schedules actions to be run on the
 * next animation frame. Does *not* batch multiple actions together into a
 * single {@link requestAnimationFrame} call. This scheduler is ideal for
 * scheduling UI operations which affect the DOM.
 */
export class UiScheduler implements Scheduler {
  private pendingActions = 0;
  private stablePromise?: Promise<void>;
  private resolveStablePromise?: () => void;

  private constructor() {}

  /** Provides a {@link UiScheduler}. */
  public static from(): UiScheduler {
    return new UiScheduler();
  }

  public schedule(action: Action): CancelAction {
    let finalized = false;
    const finalize = (): void => {
      if (finalized) return;

      finalized = true;
      this.pendingActions--;
      if (this.isStable()) this.resolveStablePromise?.();
    };


    this.pendingActions++;
    const id = requestAnimationFrame(() => {
      try {
        action();
      } finally {
        finalize();
      }
    });

    return () => {
      cancelAnimationFrame(id);

      finalize();
    };
  }

  public isStable(): boolean {
    return this.pendingActions === 0;
  }

  public async stable(): Promise<void> {
    if (this.isStable()) return;

    if (!this.resolveStablePromise) {
      this.stablePromise = new Promise<void>((resolve) => {
        this.resolveStablePromise = () => {
          resolve();
          this.stablePromise = undefined;
          this.resolveStablePromise = undefined;
        };
      });
    }

    await this.stablePromise!;

    // If this last action queues a microtask which schedules a new action, then
    // that microtask will executed *after* `this.stablePromise` is resolved,
    // but before `await this.stablePromise` resumes. Therefore the scheduler
    // can still be in an unstable state, so we check to be sure and re-await to
    // be stable if a new action was added.
    if (!this.isStable()) await this.stable();
  }
}
