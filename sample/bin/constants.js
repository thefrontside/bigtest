const chalk = require('chalk');

const startScript = 'parcel src/index.html';
const PACKAGE_NAME = 'bigtest-sample';
const TARGET_DIR = `${process.cwd()}/${PACKAGE_NAME}`;
const SOURCE_DIR = `${TARGET_DIR}/node_modules/${PACKAGE_NAME}`;

const yarn = process.argv.includes('-Y') || process.argv.includes('-yarn') ? true : false;
const command = yarn ? 'yarn': 'npm run';

const messages = {
  creating_dir: chalk.green('Directory created'),
  downloading_repo: {
    before: chalk`{grey Downloading project...}`,
    after: chalk`{green Download complete\n}`
  },
  organizing_files: {
    before: chalk`{grey Organizing files...}`,
    after: chalk`{green Files organized}`
  },
  installing_dep: {
    before: chalk`{grey Installing... (this'll take a few minutes)}`, 
    after: chalk`{green Installation complete\n}`
  },
  deleting: {
    before: chalk`{red Deleting generated files...}`,
    after: chalk`{red Removed generated files because of error}`
  },
  success: chalk`{white Setup is complete!}\n\nNow you can start exploring:\n\n  {magentaBright cd} {white bigtest-sample}\n\n  {magentaBright ${command}} test:{blueBright bigtest}\n  {magentaBright ${command}} test:{redBright jest}\n  {magentaBright ${command}} test:{green cypress}\n\n{yellow Have any questions?}\nReach us at: {cyan https://discord.gg/RKss6jw2}\n`,
  abort: `Please rename the existing 'bigtest-sample' directory and rerun the command\n`
};

module.exports = {
  startScript,
  messages,
  yarn,
  TARGET_DIR,
  SOURCE_DIR
};
