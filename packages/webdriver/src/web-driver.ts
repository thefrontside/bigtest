import { Operation } from 'effection';
import { Atom } from '@bigtest/atom';
import { Driver } from '@bigtest/driver';
import { fetch, RequestInit } from './fetch';

export class WebDriver implements Driver<WDSession> {
  session: WDSession = { sessionId: '' };

  constructor(public serverURL: string) {}

  get description() {
    return `WebDriver<${this.serverURL}/session/${this.session.sessionId}>`;
  }

  get data() { return this.session; }

  connect(agentURL: string): Operation<void> {
    return this.navigateTo(agentURL);
  }

  *navigateTo(url: string): Operation<void> {
    yield request(`${this.serverURL}/session/${this.session.sessionId}/url`, {
      method: 'post',
      body: JSON.stringify({ url })
    });
  }
}

/**
 * Creates a webdriver session and attaches it to `driver`. This should be
 * called by either the `Remote()` or `Local()` operations internally before
 * handing out a `WebDriver` resource to the public.
 */
export function* connect(driver: WebDriver, options: Options): Operation<void> {

  let capabilities = new Atom(Capabilities);

  if (options.headless) {
    capabilities.slice<string[]>(['alwaysMatch', 'goog:chromeOptions', 'args'])
      .over(args => args.concat(['--headless']))
    capabilities.slice<string[]>(['alwaysMatch', 'moz:firefoxOptions', 'args'])
      .over(args => args.concat(['--headless']))
  }

  driver.session = yield request(`${driver.serverURL}/session`, {
    method: 'post',
    body: JSON.stringify({
      capabilities: capabilities.get()
    })
  });
}

function* request(url: string, init: RequestInit): Operation<WDResponse> {
  let response: Response = yield fetch(url, init);

  if (!response.ok) {
    let details: WDResponse;
    try {
      details = yield response.json();
    } catch (e) { /* ok, no json details*/}
    if (details && details.value && details.value) {
      throw new Error(details.value.message);
    } else {
      throw new Error(`RequestError: ${response.status} ${response.statusText}`)
    }
  }
  let json = yield response.json();
  return json.value;
}

export interface Options {
  browserName: 'chrome' | 'firefox' | 'safari';
  headless: boolean;
}

interface WDSession {
  sessionId: string;
}

interface WDResponse {
  value: {
    message?: string;
  };
}

const Capabilities = {
  alwaysMatch: {
    'goog:chromeOptions': {
      args: []
    },
    'moz:firefoxOptions': {
      args: []
    }
  }
};
