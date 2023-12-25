import {
  getConfig,
  sessionFailed,
  sessionFinished,
  sessionStarted,
} from '@web/test-runner-core/browser/session.js';

// Web Test Runner uses a different HTML page for every test, so we only get
// one `testFile` for the single `*.js` file we need to execute.
const { testFile: htmlFile } = await getConfig();
const testFile = htmlFile.replace(/\.html(?=\?|$)/, '.js');

await sessionStarted();

// Load the test file and evaluate it.
try {
  await import(new URL(testFile, document.baseURI).href);

  await sessionFinished({
    passed: true,
    testResults: {
      name: '',
      suites: [],
      tests: [
        {
          name: 'test',
          passed: true,
        }
      ],
    },
  });
} catch (err) {
  await sessionFailed(err);
}
