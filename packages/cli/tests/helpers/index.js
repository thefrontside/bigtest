import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import logger from '@util/logger';

export { expect } from 'chai';
export { fake } from 'sinon';
export { when } from '@bigtest/convergence';

export { default as request } from '@run/util/request';

export { default as defer } from './defer';
export { default as dedent } from './dedent';
export { default as readFile } from './read-file';

// setup chai extensions
chai.use(chaiAsPromised);
chai.use(sinonChai);

// silence the global logger
logger.level = 'silent';
