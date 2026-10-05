import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';

expect.extend(axeMatchers);

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Assertion extends AxeMatchers {}
}
