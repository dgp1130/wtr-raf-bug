import { UiScheduler } from './ui-scheduler.js';

it('RAF works', async () => {
  const scheduler = UiScheduler.from();

  for (let i = 0; i < 20; ++i) {
    scheduler.schedule(() => {});
    await scheduler.stable();
  }

  expect().nothing();
});
