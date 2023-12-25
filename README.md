# Web Test Runner `requestAnimationFrame` Bug

This is a minimal reproduction of a bug in Web Test Runner where
`requestAnimationFrame` does not trigger sometimes. It is highly inconsistent,
but the tests in this repo are flaky approximately 1/10 of the time.

## Reproduction

The two tests are under [`src/`](./src/) and call `requestAnimationFrame` in a
specific way. Install the repository with:

```shell
npm ci
```

Run tests with:

```shell
npm test
```

This will occasionally fail with a timeout which looks like:

```
dist/src/1.test.html:

 🚧 Browser logs:
      start @ 1703487176420
      requestAnimationFrame - 1 @ 1703487176420
      callback - 1 @ 1703487176424
      requestAnimationFrame - 3 @ 1703487176425
      callback - 3 @ 1703487176426
      requestAnimationFrame - 5 @ 1703487176427
      callback - 5 @ 1703487176443
      requestAnimationFrame - 7 @ 1703487176443
      cancelAnimationFrame - 7 @ 1703487176443

dist/src/2.test.html:

 🚧 Browser logs:
      start @ 1703487176427
      requestAnimationFrame - 1 @ 1703487176428
      callback - 1 @ 1703487176447
      requestAnimationFrame - 3 @ 1703487176447

 ❌ Error: FAILED: Timeout after 1000 milliseconds @ 1703487177428!
      at src/timeout.ts:15:12
      at async timeout (src/timeout.ts:7:9)
      at dist/async%20http:/localhost:8000/src/2.test.js:3:1

Chromium: |██████████████████████████████| 2/2 test files | 1 passed, 0 failed
```

These logs came from [patching](./src/patch-raf.ts) `requestAnimationFrame` and
`cancelAnimationFrame` and observing their execution. Test 1 appears to execute
correctly, while test 2 fails waiting for `requestAnimationFrame`. Note that
a RAF call with handle `3` was scheduled but the callback was never invoked for
almost a full second. Longer timeouts do not fix this flaky behavior.

## Fix

The fix is to create a new browser context for every page. See
`puppeteerLauncher` in
[`web-test-runner.config.mjs`](./web-test-runner.config.mjs)

## Puppeteer

The `puppeteer` branch is able to replicate similar behavior by calling
Puppeteer directly and not using Web Test Runner at all. It does this by using
two pages from the same browser context.

The fix is to create two different incognito contexts for the pages.
