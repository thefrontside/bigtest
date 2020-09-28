import { test } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';

import { coverageData } from './coverage-data';

interface CoverageHolder {
  __coverage__: Record<string, unknown>;
}

export default test('Coverage Test')
  .step("add coverage data", async() => {
    let window: Window = bigtestGlobals.testFrame.contentWindow.window;
    let holder = window as unknown as CoverageHolder;
    holder.__coverage__ = coverageData
  })
