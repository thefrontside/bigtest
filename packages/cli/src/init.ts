import { Operation } from 'effection';
import { ProjectOptions, getConfigFilePath, defaultTSConfig } from '@bigtest/project';
import { promises as fs, existsSync } from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

import { Prompt } from './prompt';

const GIT_IGNORE = '.gitignore';

function formatJSON(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function* init(configFile: string): Operation<void> {
  let prompt = yield Prompt.create();

  let isYarn = !!getConfigFilePath('yarn.lock');

  let options: Partial<ProjectOptions>;

  try {
    options = JSON.parse(yield fs.readFile(path.resolve(configFile)));
  } catch {
    options = {
      port: 24000,
      launch: ['chrome.headless']
    };
  }

  if(!options.app) { options.app = {} }

  options.port = yield prompt.number('Which port would you like to run BigTest on?', {
    name: 'port',
    defaultValue: options.port,
    min: 0,
    max: 65535,
  })

  options.testFiles = [yield prompt.string('Where are your test files located?', {
    name: 'testFiles',
    defaultValue: (options.testFiles || [])[0] || 'test/**/*.test.{ts,js}',
  })]

  if(yield prompt.boolean('Do you want BigTest to start your application for you?', { defaultValue: true })) {
    options.app.command = yield prompt.string('What command do you run to start your application?', {
      name: 'app.command',
      defaultValue: options.app.command || (isYarn ? 'yarn start' : 'npm start'),
    })
    options.app.env = {
      PORT: yield prompt.number('Which port would you like to run your application on?', {
        name: 'app.env.PORT',
        defaultValue: Number(options.app.env?.PORT) || 3000,
        min: 0,
        max: 65535,
      })
    }
    options.app.url = yield prompt.string('Which URL do you use to access your application?', {
      name: 'app.url',
      defaultValue: options.app.url || `http://localhost:${options.app.env.PORT}`,
    });
  } else {
    delete options.app.command;
    delete options.app.env;
    options.app.url = yield prompt.string('Which URL do you use to access your application?', {
      name: 'app.url',
      defaultValue: options.app.url,
    });
  }

  if(yield prompt.boolean('Do you want to write your tests in TypeScript?')) {
    if(yield prompt.boolean('Do you want to set up a separate TypeScript `tsconfig` file for BigTest?', { defaultValue: true })) {
      options.tsconfig = yield prompt.string('Where should the custom `tsconfig` be located?', {
        name: 'tsconfig',
        defaultValue: options.tsconfig || './tsconfig.bigtest.ts',
      })
    }
  }

  process.stdout.write(chalk.white('\nSetting up project\n'));

  process.stdout.write(chalk.grey(`- adding ignore to ${GIT_IGNORE} ... `));
  if(existsSync(GIT_IGNORE) && (yield fs.readFile(GIT_IGNORE)).toString().includes('.bigtest')) {
    process.stdout.write(chalk.grey('skipped\n'));
  } else {
    yield fs.writeFile(GIT_IGNORE, '.bigtest\n', { flag: 'a' });
    process.stdout.write(chalk.grey('done\n'));
  }

  if(options.tsconfig) {
    process.stdout.write(chalk.grey(`- writing custom tsconfig ${options.tsconfig} ... `));
    if(existsSync(options.tsconfig)) {
      process.stdout.write(chalk.grey('skipped\n'));
    } else {
      yield fs.writeFile(options.tsconfig, formatJSON(defaultTSConfig()));
      process.stdout.write(chalk.grey('done\n'));
    }
  }

  process.stdout.write(chalk.grey(`- writing config file ${configFile} ... `));
  yield fs.mkdir(path.dirname(configFile), { recursive: true });
  yield fs.writeFile(configFile, formatJSON(options) + '\n');
  process.stdout.write(chalk.grey('done\n'));
  process.stdout.write(chalk.white('\nSetup complete!\n'));
}
