import * as JSON5 from 'json5';
import { Options as WebDriverOptions } from '@bigtest/webdriver';

export type Launches = Record<string, Partial<WebDriverOptions>>;

/**
 * parses a launch spec
 */
export function parseLaunches(spec: string | string[]): Launches {
  let specs = typeof spec === 'string' ? [spec] : spec;
  return specs.reduce(parseSpec, {})
}

function parseSpec(launches: Launches, spec: string): Launches {
  let [nickname, optionsSpec] = spec.split('@');
  return Object.assign(launches, {
    [nickname]: parseOptions(optionsSpec)
  });
}


// headless:true
function parseOptions(optionsSpec: string): Partial<WebDriverOptions> {
  if (!optionsSpec || optionsSpec.trim() === '') {
    return {};
  } else {
    return JSON5.parse(`{${optionsSpec}}`);
  }
}
