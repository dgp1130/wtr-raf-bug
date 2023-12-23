import { nextFrame } from '../../testing/timing.js';
import { UiScheduler } from './ui-scheduler.js';

describe('ui-scheduler', () => {
  describe('UiScheduler', () => {
    xdescribe('schedule', () => {
      it('schedules on the next animation frame', async () => {
        const scheduler = UiScheduler.from();
        const action = jasmine.createSpy<() => void>('action');

        scheduler.schedule(action);
        expect(action).not.toHaveBeenCalled();

        await nextFrame();
        expect(action).toHaveBeenCalledOnceWith();
      });

      it('cancels a scheduled action when the cancel callback is invoked', async () => {
        const scheduler = UiScheduler.from();
        const action = jasmine.createSpy<() => void>('action');

        const cancel = scheduler.schedule(action);
        expect(action).not.toHaveBeenCalled();

        cancel();
        expect(action).not.toHaveBeenCalled();

        await nextFrame();
        expect(action).not.toHaveBeenCalled();
      });

      it('schedules multiple actions concurrently', async () => {
        const scheduler = UiScheduler.from();
        const action1 = jasmine.createSpy<() => void>('action1');
        const action2 = jasmine.createSpy<() => void>('action2');

        scheduler.schedule(action1);
        scheduler.schedule(action2);

        expect(action1).not.toHaveBeenCalled();
        expect(action2).not.toHaveBeenCalled();

        await nextFrame();

        expect(action1).toHaveBeenCalled();
        expect(action2).toHaveBeenCalled();
      });

      it('schedules multiple actions *without* batching them together', async () => {
        const scheduler = UiScheduler.from();

        const calls: Array<jasmine.Spy> = [];
        const action1 = jasmine.createSpy<() => void>('action1')
            .and.callFake(() => { calls.push(action1); });
        const action2 = jasmine.createSpy<() => void>('action2')
            .and.callFake(() => { calls.push(action2); });
        const action3 = jasmine.createSpy<() => void>('action3')
            .and.callFake(() => { calls.push(action3); });

        scheduler.schedule(action1);
        requestAnimationFrame(action2);
        scheduler.schedule(action3);

        expect(calls).toEqual([]);

        await nextFrame();

        expect(calls).toEqual([ action1, action2, action3 ]);
      });

      it('cancels actions independently', async () => {
        const scheduler = UiScheduler.from();
        const action1 = jasmine.createSpy<() => void>('action1');
        const action2 = jasmine.createSpy<() => void>('action2');

        const cancel1 = scheduler.schedule(action1);
        scheduler.schedule(action2);

        cancel1();

        expect(action1).not.toHaveBeenCalled();
        expect(action2).not.toHaveBeenCalled();

        await nextFrame();

        expect(action1).not.toHaveBeenCalled();
        expect(action2).toHaveBeenCalledOnceWith();
      });

      it('ignores canceling actions which have already executed', async () => {
        const scheduler = UiScheduler.from();
        const action1 = jasmine.createSpy<() => void>('action1');
        const action2 = jasmine.createSpy<() => void>('action2');

        const cancel = scheduler.schedule(action1);

        await nextFrame();
        expect(action1).toHaveBeenCalledOnceWith();
        action1.calls.reset();

        expect(() => cancel()).not.toThrow();
        expect(action1).not.toHaveBeenCalled();

        scheduler.schedule(action2);

        await nextFrame();
        expect(action1).not.toHaveBeenCalledOnceWith();
        expect(action2).toHaveBeenCalledOnceWith();
      });
    });

    describe('stable', () => {
      xit('resolves immediately when no actions are pending', async () => {
        const scheduler = UiScheduler.from();

        await expectAsync(scheduler.stable()).toBeResolved();
      });

      xit('waits and resolves once pending actions have completed', async () => {
        const scheduler = UiScheduler.from();

        scheduler.schedule(() => {});

        const stable = scheduler.stable();
        await expectAsync(stable).toBePending();

        await nextFrame();
        await expectAsync(stable).toBeResolved();
      });

      it('waits for actions scheduled in an action callback', async () => {
        console.log('start - waits for actions scheduled in an action callback'); // DEBUG

        const scheduler = UiScheduler.from();

        const action = jasmine.createSpy<() => void>('action');

        scheduler.schedule(() => {
          scheduler.schedule(action);
        });

        await scheduler.stable();
        expect(action).toHaveBeenCalled();
        console.log('done - waits for actions scheduled in an action callback'); // DEBUG
      });

      // If this last action queues a microtask which schedules a new action,
      // then that microtask would be executed *after* the scheduler decides it
      // is stable but before `await scheduler.stable()` can resume, meaning the
      // scheduler might still be unstable even after the `await`. This test
      // exercises this exact case.
      it('waits for actions scheduled in microtasks from an action', async () => {
        console.log('start - waits for actions scheduled in microtasks from an action'); // DEBUG

        const scheduler = UiScheduler.from();

        const action = jasmine.createSpy<() => void>('action');

        scheduler.schedule(() => {
          // queueMicrotask(() => {
            scheduler.schedule(action);
          // });
        });

        await scheduler.stable();

        expect(scheduler.isStable()).toBeTrue();
        expect(action).toHaveBeenCalled();
        console.log('done - waits for actions scheduled in microtasks from an action'); // DEBUG
      });

      // Replicate the previous test case multiple times in a row to verify that
      // the scheduler correctly waits each time it happens consecutively.
      it('recursively waits for actions scheduled in microtasks from an action', async () => {
        console.log('start - recursively waits for actions scheduled in microtasks from an action'); // DEBUG

        const scheduler = UiScheduler.from();

        const action = jasmine.createSpy<() => void>('action');

        scheduler.schedule(() => {
          // queueMicrotask(() => {
          //   scheduler.schedule(() => {
          //     queueMicrotask(() => {
                scheduler.schedule(action);
          //     });
          //   });
          // });
        });

        await scheduler.stable();

        expect(scheduler.isStable()).toBeTrue();
        expect(action).toHaveBeenCalled();
        console.log('done - recursively waits for actions scheduled in microtasks from an action'); // DEBUG
      });

      xit('handles actions which are both executed *and* canceled', async () => {
        const scheduler = UiScheduler.from();

        const action = jasmine.createSpy<() => void>('action');

        const cancel = scheduler.schedule(() => {});
        await scheduler.stable(); // Executes action.
        cancel(); // Canceled after execution.
        expect(scheduler.isStable()).toBeTrue();

        scheduler.schedule(action);

        // Stability not be corrupted.
        expect(scheduler.isStable()).toBeFalse();
        await scheduler.stable();
        expect(scheduler.isStable()).toBeTrue();
        expect(action).toHaveBeenCalled();
      });

      it('handles actions which are canceled multiple times', async () => {
        console.log(`start - handles actions which are canceled multiple times - ${new Date().getTime()}`); // DEBUG

        const scheduler = UiScheduler.from();

        const action = jasmine.createSpy<() => void>('action');

        // Schedule an action and *incorrectly* cancel it twice.
        const cancel = scheduler.schedule(() => {});
        cancel();
        cancel();
        expect(scheduler.isStable()).toBeTrue();

        // Stability not be corrupted.
        scheduler.schedule(action);
        expect(scheduler.isStable()).toBeFalse();
        await scheduler.stable();
        console.log(`Stable!`); // DEBUG
        expect(scheduler.isStable()).toBeTrue();
        expect(action).toHaveBeenCalled();
        console.log('done - handles actions which are canceled multiple times'); // DEBUG
      });
    });
  });
});
