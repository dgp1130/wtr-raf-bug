import { createServer } from 'http-server';
import puppeteer from 'puppeteer';

const server = createServer({ root: 'dist' });
const port = 8000;
await new Promise((resolve) => {
  server.listen(port, () => { resolve(); });
});

const browser = await puppeteer.launch({ headless: 'new' });

// Fix: Use a different context for each page.
// const context1 = await browser.createIncognitoBrowserContext();
// const page1 = await context1.newPage();
const page1 = await browser.newPage();
page1.on('console', msg => console.log('Test 1:', msg.text()));
await page1.goto(`http://localhost:${port}/src/1.test.html`);

// Fix: Use a different context for each page.
// const context2 = await browser.createIncognitoBrowserContext();
// const page2 = await context2.newPage();
const page2 = await browser.newPage();
page2.on('console', msg => console.log('Test 2:', msg.text()));
await page2.goto(`http://localhost:${port}/src/2.test.html`);

try {
  await Promise.all([
    timeout(1_000, () => page1.evaluate(() => import('./1.test.js'))),
    timeout(1_000, () => page2.evaluate(() => import('./2.test.js'))),
  ]);
} catch (err) {
  console.error(err);
}

await browser.close();

await new Promise((resolve, reject) => {
  server.close((err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

/**
 * Run the given async callback and return a `Promise` which awaits the result
 * or throws an error if the callback takes longer than the provided timeout.
 */
export async function timeout(ms, callback) {
  return await Promise.race([
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

      throw new Error(`FAILED: Timeout after ${ms} milliseconds @ ${
          new Date().getTime()}!`);
    })(),

    callback(),
  ]);
}
