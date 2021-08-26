import { Operation, Resource, ensure } from 'effection';
import chalk from 'chalk';
import readline from 'readline';

interface Prompt {
  write(data: string): void;
  number(text: string, options?: { name?: string; defaultValue?: number; min?: number; max?: number }): Operation<number>;
  boolean(text: string, options?: { name?: string; defaultValue?: boolean }): Operation<boolean>;
  string(text: string, options?: { name?: string; defaultValue?: string }): Operation<string>;
}

export function createPrompt(): Resource<Prompt> {
  return {
    *init() {
      let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      function write(data: string): void {
        process.stdout.write(data);
      };

      function ask(options: { name?: string; defaultValue?: string } = {}): Operation<string> {
        return {
          perform: (resolve) => {
            let question = '  ';
            if(options.name) {
              question = question + chalk.white(options.name) + ' ';
            }
            if(options.defaultValue) {
              question = question + chalk.grey(`(${options.defaultValue})`);
            }
            question = question + chalk.white(' > ');
            rl.question(question, (value) => resolve(value));
          }
        }
      };

      function writeQuestion(text: string) {
        write(chalk.white('⌾ ') + chalk.grey(text + '\n'));
      };

      yield ensure(() => rl.close());

      return {
        write,

        *number(text, options = {}): Operation<number> {
          writeQuestion(text);
          while(true) {
            let value = yield ask({ name: options.name, defaultValue: options.defaultValue?.toString() });
            if(!value.length && (options.defaultValue != null)) {
              return options.defaultValue;
            } else if(isNaN(Number(value))) {
              write(chalk.red('  Not a number!\n'));
            } else if((options.min != null) && (Number(value) < options.min)) {
              write(chalk.red(`  Must not be lower than ${options.min}!\n`));
            } else if((options.max != null) && (Number(value) > options.max)) {
              write(chalk.red(`  Must not be higher than ${options.max}!\n`));
            } else {
              return Number(value);
            }
          }
        },

        *boolean(text, options = {}): Operation<boolean> {
          writeQuestion(text + ' (yes/no)');
          while(true) {
            let defaultValue = (options.defaultValue != null) ? (options.defaultValue ? 'yes' : 'no') : undefined;
            let value = yield ask({ name: options.name, defaultValue });
            if(!value.length && (options.defaultValue != null)) {
              return options.defaultValue;
            } else if(value.toLowerCase() === 'n' || value.toLowerCase() === 'no') {
              return false;
            } else if(value.toLowerCase() === 'y' || value.toLowerCase() === 'yes') {
              return true;
            } else {
              write(chalk.red('  Respond with yes/no or y/n\n'));
            }
          }
        },

        *string(text, options = {}): Operation<string> {
          writeQuestion(text);
          let value = yield ask({ name: options.name, defaultValue: options.defaultValue });
          if(!value.length && (options.defaultValue != null)) {
            return options.defaultValue;
          } else {
            return value;
          }
        }
      }
    }
  }
};
