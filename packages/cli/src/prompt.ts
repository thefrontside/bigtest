import { Operation, resource } from 'effection';
import chalk from 'chalk';
import readline from 'readline';
import { ReadLine } from 'readline';

export class Prompt {
  static *create(): Operation<Prompt> {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return yield resource(new Prompt(rl), function*() {
      try {
        yield;
      } finally {
        rl.close();
      }
    });
  }

  private constructor(private rl: ReadLine) {}

  write(data: string): void {
    process.stdout.write(data);
  }

  private ask(options: { name?: string; defaultValue?: string } = {}): Operation<string> {
    return ({ resume }) => {
      let question = '  ';
      if(options.name) {
        question = question + chalk.white(options.name) + ' ';
      }
      if(options.defaultValue) {
        question = question + chalk.grey(`(${options.defaultValue})`);
      }
      question = question + chalk.white(' > ');
      this.rl.question(question, (value) => resume(value));
    }
  }

  private writeQuestion(text: string) {
    this.write(chalk.white('⌾ ') + chalk.grey(text + '\n'));
  }

  *number(text: string, options: { name?: string; defaultValue?: number; min?: number; max?: number } = {}): Operation<number> {
    this.writeQuestion(text);
    while(true) {
      let value = yield this.ask({ name: options.name, defaultValue: options.defaultValue?.toString() });
      if(!value.length && (options.defaultValue != null)) {
        return options.defaultValue;
      } else if(isNaN(Number(value))) {
        this.write(chalk.red('  Not a number!\n'));
      } else if((options.min != null) && (Number(value) < options.min)) {
        this.write(chalk.red(`  Must not be lower than ${options.min}!\n`));
      } else if((options.max != null) && (Number(value) > options.max)) {
        this.write(chalk.red(`  Must not be higher than ${options.max}!\n`));
      } else {
        return Number(value);
      }
    }
  }

  *boolean(text: string, options: { name?: string; defaultValue?: boolean } = {}): Operation<boolean> {
    this.writeQuestion(text + ' (yes/no)');
    while(true) {
      let defaultValue = (options.defaultValue != null) ? (options.defaultValue ? 'yes' : 'no') : undefined;
      let value = yield this.ask({ name: options.name, defaultValue });
      if(!value.length && (options.defaultValue != null)) {
        return options.defaultValue;
      } else if(value.toLowerCase() === 'n' || value.toLowerCase() === 'no') {
        return false;
      } else if(value.toLowerCase() === 'y' || value.toLowerCase() === 'yes') {
        return true;
      } else {
        this.write(chalk.red('  Respond with yes/no or y/n\n'));
      }
    }
  }

  *string(text: string, options: { name?: string; defaultValue?: string }): Operation<string> {
    this.writeQuestion(text);
    let value = yield this.ask({ name: options.name, defaultValue: options.defaultValue });
    if(!value.length && (options.defaultValue != null)) {
      return options.defaultValue;
    } else {
      return value;
    }
  }
}

