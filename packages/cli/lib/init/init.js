import { existsSync } from 'fs-extra';
import logger from '@util/logger';

import cleanupFiles from './utils/clean-up-files';
import { copyNetwork, copyWithFramework } from './utils/copy-with';

const CWD = process.cwd();
const BIGTEST_DIR = `${CWD}/bigtest`;

export default async function init({ network, appFramework } = {}) {
  let bigtestDirExists = existsSync(BIGTEST_DIR);
  let networkDirExists = existsSync(`${BIGTEST_DIR}/network`);
  let isCreatingNetwork = !networkDirExists && network;

  if (bigtestDirExists && !isCreatingNetwork) {
    logger.info('Looks like BigTest is already initialized');
    return;
  }

  if (bigtestDirExists && isCreatingNetwork) {
    await copyNetwork(CWD, appFramework);
    logger.info('@bigtest/network has been initialized');
    return;
  }

  try {
    let { needsNetwork } = await copyWithFramework(CWD, appFramework, network);
    let networkMessage = needsNetwork ? 'and @bigtest/mirage' : '';

    logger.info(
      `BigTest has been initialized with @bigtest/${appFramework} ${networkMessage}`
    );
  } catch (error) {
    logger.error('Initialize failed :(');
    logger.error(error);

    await cleanupFiles('bigtest', CWD);
  }
}
