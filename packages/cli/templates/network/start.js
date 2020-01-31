import Mirage, { camelize } from '@bigtest/mirage';

import baseConfig from './config';
import './force-fetch-polyfill';

import * as scenarios from './scenarios';
import * as factories from './factories';
// import * as fixtures from './fixtures';
// import * as models from './models';
// import * as serializers from './serializers';

const environment = process.env.NODE_ENV;

export default function startMirage(...scenarioNames) {
  let server = new Mirage({
    // Uncomment these imports if you add files
    //
    // factories,
    // fixtures,
    // models,
    // serializers,
    scenarios,
    environment,
    baseConfig
  });

  // mirage does not load our factories outside of testing when we do
  // not declare a default scenario, so we load them ourselves
  if (environment !== 'test') {
    server.loadFactories(factories);
  }

  // mirage only loads a `default` scenario for us out of the box, so
  // instead we run any scenarios after we initialize mirage
  scenarioNames.filter(Boolean).forEach(scenarioName => {
    let scenario = scenarios[camelize(scenarioName)];
    if (scenario) scenario(server);
  });

  return server;
}
