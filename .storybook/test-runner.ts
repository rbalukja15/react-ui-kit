import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

// Runs every story in a real browser: its play function, if it has one,
// then an axe scan of what the story rendered.
const config: TestRunnerConfig = {
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
