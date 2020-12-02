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

  //we need this to synchronize in testing because
  //async finally blocks are not yet supported. It
  //should not be used anywhere.
  active = false;
}

/**
 * Creates a webdriver session and attaches it to `driver`. This should be
 * called by either the `Remote()` or `Local()` operations internally before
 * handing out a `WebDriver` resource to the public.
 */
export function* connect(driver: WebDriver, options: Options): Operation<void> {

  let capabilities = new Atom(Capabilities);

  if (options.headless != null && options.headless) {
    capabilities.slice('alwaysMatch', 'goog:chromeOptions', 'args')
      .over(args => args.concat(['--headless']))
    capabilities.slice('alwaysMatch', 'moz:firefoxOptions', 'args')
      .over(args => args.concat(['--headless']))
  }

  driver.session = yield post(`${driver.serverURL}/session`, {
    capabilities: capabilities.get()
  });
  driver.active = true;
}

export function* disconnect(driver: WebDriver): Operation<void> {
  yield request(`${driver.serverURL}/session/${driver.session.sessionId}/window`, {
    method: 'delete'
  }, () => Promise.resolve());
  driver.active = false;
}

function* request<T>(url: string,init: RequestInit, handler: (response: Response) => Operation<T>): Operation<T> {
  let response: Response = yield fetch(url, init);
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
  } else {
    return yield handler(response);
  }
}

function* post(url: string, params: Record<string, unknown>): Operation<WDResponse> {
  let method = 'post';
  let body = JSON.stringify(params);
  let headers = {
    "Content-Type": "application/json"
  };

  return yield request(url, { method, body, headers }, function*(response) {
    let json = yield response.json();
    return json.value;
  });
}

export type LocalOptions = {
  type: 'local';
  headless: boolean;
  browserName: 'chrome' | 'firefox' | 'safari';
};

export type RemoteOptions = {
  type: 'remote';
  url: string;
  headless?: boolean;
};

export type Options = LocalOptions | RemoteOptions;

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
