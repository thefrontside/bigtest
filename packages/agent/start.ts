import { createWebDriver, WebDriver } from '@bigtest/webdriver';
import { express, Express } from '@bigtest/effection-express';

import { Resource, createQueue, Queue, spawn, main } from 'effection';
import { static as staticMiddleware } from 'express';

import fixtureManifest from './test/fixtures/manifest';

import { AgentServerConfig, createAgentHandler, AgentConnection } from './src/index';

function staticServer(): Resource<Express> {
  return {
    *init() {
      let app = yield express();
      app.raw.use(staticMiddleware("./tmp/test"));
      yield app.listen(8000);
      return app;
    }
  }
}

let config = new AgentServerConfig({ port: 8000 });

let connections: Queue<AgentConnection>;

main(function*() {
  connections = createQueue();
  yield staticServer();

  let handler = yield express();
  handler.ws('*', createAgentHandler((connection) => function*() {
    connections.send(connection);
    yield;
  }));
  yield handler.listen(8001);

  let browser: WebDriver = yield createWebDriver({ type: 'local', headless: process.env.CI ? true : false });

  yield browser.connect(config.agentUrl(`ws://localhost:8001`));

  let connection: AgentConnection = yield connections.expect();

  let testRunId = 'test-run-1';

  let manifestUrl = 'http://localhost:8000/global-manifest.js';
  let appUrl = 'http://localhost:8000';
  let stepTimeout = 500;

  yield connection.send({ type: 'run', testRunId, manifestUrl, appUrl, tree: fixtureManifest, stepTimeout });

  yield connection.forEach((m) => {
    console.log("MESSAGE", m);
  });
});
