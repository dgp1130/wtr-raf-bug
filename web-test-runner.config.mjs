import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

const require = createRequire(import.meta.url);
const jasminePath = require.resolve('jasmine-core/lib/jasmine-core/jasmine.js');

// See: https://github.com/blueprintui/web-test-runner-jasmine/blob/d07dad01e9e287ea96c41c433c6f787f6170566a/src/index.ts
const testRunner = `
<!-- Inject Jasmine dependency. This seems to require "sloppy" mode. -->
<script>
${fs.readFileSync(jasminePath, 'utf8')}
</script>

<!-- Run the tests. -->
<script type="module">
${fs.readFileSync('jasmine-runner.mjs', 'utf8')}
</script>
`.trim();

const testFramework = {
  config: {
    defaultTimeoutInterval: 1_000,
    failSpecWithNoExpectations: true,
    autoCleanClosures: true,
    seed: 27656,
  },
};

// TODO: Export this plugin (or a Mocha version) as WTR doesn't seem to make prerendered HTML tests easy.
// See: https://modern-web.dev/docs/dev-server/writing-plugins/overview/
const jasminePlugin = {
  name: 'jasmine',
  transform(ctx) {
    if (!ctx.response.is('html') || ctx.url === '/') return;

    return { body: ctx.body.replace('</head>', () => `${testRunner}</head>`) };
  },
};

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  testFramework,
  rootDir: 'dist/',
  nodeResolve: true,
  plugins: [ jasminePlugin ],
  concurrency: 2,
  concurrentBrowsers: 1,
  browsers: [
    puppeteerLauncher(),
  ],
};
