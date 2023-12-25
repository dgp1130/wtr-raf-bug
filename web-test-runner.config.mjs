import * as fs from 'node:fs';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

// See: https://github.com/blueprintui/web-test-runner-jasmine/blob/d07dad01e9e287ea96c41c433c6f787f6170566a/src/index.ts
const testRunner = `
<!-- Run the tests. -->
<script type="module">
${fs.readFileSync('runner.mjs', 'utf8')}
</script>
`.trim();

const testRunnerPlugin = {
  name: 'test-runner',
  transform(ctx) {
    if (!ctx.response.is('html') || ctx.url === '/') return;

    return { body: ctx.body.replace('</head>', () => `${testRunner}</head>`) };
  },
};

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  testFramework: {},
  rootDir: 'dist/',
  nodeResolve: true,
  plugins: [ testRunnerPlugin ],
  concurrency: 2,
  concurrentBrowsers: 1,
  browsers: [
    puppeteerLauncher({
      // Fix: Use a new browser context for each page.
      // createPage: async ({ context }) => {
      //   return (await context.browser().createIncognitoBrowserContext()).newPage();
      // },
    }),
  ],
};
