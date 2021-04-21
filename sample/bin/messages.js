const chalk = require('chalk');
const command = process.argv.includes('-Y') || process.argv.includes('-yarn') ? 'yarn' : 'npm run';

const messages = {
  creating_dir: chalk.green('Directory created'),
  organizing_files: {
    before: chalk`{grey Organizing files...}`,
    after: chalk`{green Files organized}`
  },
  installing_dep: {
    before: chalk`{grey Installing... (this'll take a few minutes)}`,
    after: chalk`{green Installation complete\n}`
  },
  cleanup: chalk`{red Removed generated files because of error\n}`,
  abort: `Please rename the existing 'bigtest-sample' directory and rerun the command\n`
}

const generateInstructions = (template) => {
  let commands;
  const jestCommand = `  ${chalk`{magentaBright ${command}} test:{redBright jest}\n`}`;
  const cypressCommand = `  ${chalk`{magentaBright ${command}} test:{green cypress}\n`}`;
  const bigtestCommand = `  ${chalk`{magentaBright ${command}} test:{blueBright bigtest}\n`}`;
  switch(template){
    case 'cypress':
      commands = cypressCommand;
      break;
    case 'jest':
      commands = jestCommand;
      break;
    case 'bigtest':
      commands = bigtestCommand;
      break;
    default:
      commands = bigtestCommand.concat(jestCommand, cypressCommand);
  };
  return chalk`{white Setup is complete!}\n\nNow you can start exploring:\n\n  {magentaBright cd} {white bigtest-sample}\n\n${commands}\n{yellow Have any questions?}\nReach us at: {cyan https://discord.gg/RKss6jw2}\n`;
}

module.exports = {
  messages,
  generateInstructions
};
