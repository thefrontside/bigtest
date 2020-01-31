import { join } from 'path';
import { copy } from 'fs-extra';

const CLI_TEMPLATE_DIR = join(__dirname, '../../../templates');

export async function copyNetwork(CWD, framework) {
  await copy(`${CLI_TEMPLATE_DIR}/network`, `${CWD}/bigtest/network`);
  await copy(
    `${CLI_TEMPLATE_DIR}/helpers/${framework}-network`,
    `${CWD}/bigtest/helpers`
  );

  return true;
}

export async function copyWithFramework(CWD, framework, needsNetwork) {
  await copy(`${CLI_TEMPLATE_DIR}/bigtest`, `${CWD}/bigtest`);
  await copy(
    `${CLI_TEMPLATE_DIR}/helpers/${framework}`,
    `${CWD}/bigtest/helpers`
  );

  if (needsNetwork) {
    await copyNetwork(CWD, framework);
  }

  return { needsNetwork };
}
