import './patch-raf.js';

it('RAF test 2', async () => {
  for (let i = 0; i < 20; ++i) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => { resolve(); });
    });
  }

  expect().nothing();
});
