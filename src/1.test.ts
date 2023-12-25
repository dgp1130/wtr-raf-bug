import './patch-raf.js';

console.log(`start test 1 @ ${new Date().getTime()}`);

// Need to run this at least 3 times. A smaller number seems to consistently
// fix the tests. A larger number can still be flaky, but doesn't appear to
// increase the flakiness. If anything, more iterations may actually reduce
// flakiness.
const iterations = 3;

for (let i = 0; i < iterations; ++i) {
  // Schedule a RAF call and await for it to be invoked.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => { resolve(); });
  });
}

// Request and immediately cancel one more RAF.
const id = requestAnimationFrame(() => { });
  cancelAnimationFrame(id);
