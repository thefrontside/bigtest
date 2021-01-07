import { test } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';

import { coverageData } from './coverage-data';

interface CoverageHolder {
  __coverage__: unknown;
}

export default test('Coverage Test')
  .step("add coverage data", async() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    let window = bigtestGlobals.testFrame.contentWindow.window as CoverageHolder;
    window.__coverage__ = coverageData;
  });
