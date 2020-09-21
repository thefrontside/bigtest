import './__coverage__';
import { createCoverageMap, CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';

interface CoverageConfigurable {
  coverageMap?: CoverageMap;
}

/**
 * Get the coverage map associated with the scope designated by
 *`Window`. By allowing scope to be an argument, we can access the coverage
 * map from both the test _and_ the agent frame.
 */
export function getCoverageMap(window: Window): CoverageMap | undefined {
  let context: typeof globalThis = window.window;
  let bigtest: CoverageConfigurable = context.__bigtest as CoverageConfigurable;
  if (!bigtest) {
    bigtest = context.__bigtest = {};
  }
  return bigtest.coverageMap;
}

/**
 * Set the coverage map associated with the scope designated by
 *`Window`. By allowing scope to be an argument, we can access the coverage
 * map from both the test _and_ the agent frame.
 */
export function setCoverageMap(window: Window, map?: CoverageMap): void {
  let context: typeof globalThis = window.window;
  let bigtest: CoverageConfigurable = context.__bigtest as CoverageConfigurable;
  if (!bigtest) {
    bigtest = context.__bigtest = {};
  }
  bigtest.coverageMap = map;
}

/**
 * Call only from Test Frame. Grabs any coverage data off of the app frame
 * and merge it into the coverage map store on the agent frame.
 */
export function addCoverageMap(appFrame?: HTMLIFrameElement): void {
  let newCoverage = appFrame?.contentWindow?.window.__coverage__;
  if (newCoverage) {
    let coverage = getCoverageMap(window.parent) || createCoverageMap();
    coverage.merge(newCoverage as CoverageMapData);
    setCoverageMap(window.parent, coverage);
  }
}
