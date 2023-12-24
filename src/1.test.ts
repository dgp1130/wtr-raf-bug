import './patch-raf.js';

it('RAF test 1', async () => {
  for (let i = 0; i < 3; ++i) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => { resolve(); });
    });
  }

  cancelAnimationFrame(requestAnimationFrame(() => { }));

  expect().nothing();
});
