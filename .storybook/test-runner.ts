import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

// The colour mode to test in. CI runs the suite once per mode, since
// contrast is checked separately for the light and the dark palette.
const mode = process.env.STORYBOOK_MODE === 'dark' ? 'dark' : 'light';

// Runs every story in a real browser: its play function, if it has one,
// then an axe scan of what the story rendered.
const config: TestRunnerConfig = {
  // The runner loads the preview once and renders each story in it, so the
  // Mode global set in the preview's URL applies to every story.
  async prepare({ page }) {
    const url = new URL('iframe.html', process.env.TARGET_URL);
    url.searchParams.set('globals', `mode:${mode}`);
    await page.goto(url.toString(), { waitUntil: 'load' });
  },
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const story = await getStoryContext(page, context);
    if (story.parameters?.a11y?.disable) return;
    // The whole document, so dialogs and menus rendered in a portal are
    // scanned too. Only the WCAG A and AA rules: a story is a fragment, not a
    // page, so best-practice page rules (one <main>, an <h1>) do not apply.
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        ...story.parameters?.a11y?.options,
      },
    });
  },
};

export default config;
