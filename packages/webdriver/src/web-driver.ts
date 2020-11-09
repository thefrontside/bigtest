import { Operation } from 'effection';
import { Atom } from '@bigtest/atom';
import { fetch } from '@effection/fetch';
import { Driver } from '@bigtest/driver';

export class WebDriver implements Driver<WDSession> {
  session: WDSession = { sessionId: '' };

  constructor(public serverURL: string) { }

  get description() {
    return `WebDriver<${this.serverURL}/session/${this.session.sessionId}>`;
  }

  get data() { return this.session; }

  connect(agentURL: string): Operation<void> {
    return this.navigateTo(agentURL);
  }

  *navigateTo(url: string): Operation<void> {
    yield post(`${this.serverURL}/session/${this.session.sessionId}/url`, {
      url,
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
    capabilities.slice('alwaysMatch', 'goog:chromeOptions', 'args')
      .over(args => args.concat(['--headless']))
    capabilities.slice('alwaysMatch', 'moz:firefoxOptions', 'args')
      .over(args => args.concat(['--headless']))
  }

  driver.session = yield post(`${driver.serverURL}/session`, {
    capabilities: capabilities.get()
  });
}

function* post(url: string, body: Record<string, unknown>): Operation<WDResponse> {
  let response: Response = yield fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": 'application/json'
    }
  });

  if (!response.ok) {
    let details: WDResponse;
    try {
      details = yield response.json();
    } catch (e) { /* ok, no json details*/ }
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
