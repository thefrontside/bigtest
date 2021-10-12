import { Operation, ensure, fetch } from 'effection';
import { createAtom } from '@effection/atom';
import { Driver, DriverFactory } from '@bigtest/driver';
import { assert } from 'assert-ts';
import { findAvailablePortNumber } from './find-available-port-number';
import { getDriverPath } from './local';
import { daemon } from '@effection/process';
import { untilURLAvailable } from './until-url-available';

export type WebDriver = Driver<Data>;

type Data = {
  session: WDSession;
  url: string;
}

export const createWebDriver: DriverFactory<Data> = (options: Options) => {
  return {
    *init() {
      let session: WDSession;
      let url: string;

      if(options.type === 'remote') {
        url = options.url;
      } else {
        let port: number = yield findAvailablePortNumber();

        url = `http://localhost:${port}`;

        let bin = yield getDriverPath(parseBrowserName(options.browserName));

        yield daemon(`${bin} --port=${port}`);

        yield untilURLAvailable(`${url}/status`);
      }

      session = yield connect(url, options);

      // local driver will shut down executable anyway, so no need to disconnect
      if(options.type === 'remote') {
        yield ensure(function*() {
          yield disconnect(url, session.sessionId);
        });
      }

      return {
        description: `WebDriver<${url}/session/${session.sessionId}>`,
        data: {
          session,
          url
        },
        connect(agentURL: string): Operation<void> {
          return function*() {
            yield post(`${url}/session/${session.sessionId}/url`, { url: agentURL });
          }
        }
      }
    }
  }
}

/**
 * Creates a webdriver session and attaches it to `driver`. This should be
 * called by either the `Remote()` or `Local()` operations internally before
 * handing out a `WebDriver` resource to the public.
 */
export function connect(serverURL: string, options: Options): Operation<WDSession> {
  return function*() {
    let capabilities = createAtom(Capabilities);

    if (options.headless) {
      capabilities.slice('alwaysMatch', 'goog:chromeOptions', 'args')
        .update(args => args.concat(['--headless']))
      capabilities.slice('alwaysMatch', 'moz:firefoxOptions', 'args')
        .update(args => args.concat(['--headless']))
    }

    return yield post(`${serverURL}/session`, {
      capabilities: capabilities.get()
    });
  }
}

export function disconnect(serverURL: string, sessionId: string): Operation<void> {
  return function*() {
    yield request(`${serverURL}/session/${sessionId}/window`, {
      method: 'delete'
    }, () => Promise.resolve());
  }
}

function* request<T>(url: string, init: RequestInit, handler: (response: Response) => Operation<T>): Operation<T> {
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

function post(url: string, params: Record<string, unknown>): Operation<WDResponse> {
  let method = 'post';
  let body = JSON.stringify(params);
  let headers = {
    "Content-Type": "application/json"
  };

  return request(url, { method, body, headers }, (response) => function*() {
    let json = yield response.json();
    return json.value;
  });
}

export enum BrowserName {
  chrome = 'chrome',
  firefox = 'firefox',
  safari = 'safari',
  edge = 'edge',
}

export function parseBrowserName(name?: string): BrowserName {
  if(name) {
    assert(!!BrowserName[name], `not a known browser: ${name}`)
    return name as BrowserName;
  } else if(process.platform === 'win32') {
    return BrowserName.edge;
  } else {
    return BrowserName.chrome;
  }
}

export type LocalOptions = {
  type: 'local';
  headless: boolean;
  browserName?: string;
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
