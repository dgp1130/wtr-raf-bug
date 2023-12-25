import './patch-raf.js';

console.log(`start test 2 @ ${new Date().getTime()}`);

// Seems to require at least 10 iterations to flake with any kind of
// consistency.
const iterations = 20;

for (let i = 0; i < iterations; ++i) {
  // Schedule a RAF call and then await for it to be invoked.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => { resolve(); });
  });
}
