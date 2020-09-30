import { Out, OutOptions, Std, LogCategory, BundlerError } from '../../types';
import { logCategories } from './types';
import chalk from 'chalk';
import os from 'os';
import { isBundlerError, hasFields } from '../../utils';


export class ConsoleOut implements Out {
  out: Std;
  err: Std;
  setttings: OutOptions;
  prefix?: string;

  constructor(options: OutOptions) {
    this.setttings = options;
    this.out = options.out || process.stdout;
    this.err = options.err || process.stderr;
    this.prefix = options.prefix || '';
  }

  clear() {
    this.out.write("\u001b[2J\u001b[0;0H");
  }

  write(category: LogCategory, ...args: unknown[]) {
    let logCategory = logCategories[category];

    let prefix = this.prefix ? ` ${(this.prefix)} ` : '';
    let start = chalk[logCategory.bg].black(logCategory.msg.padEnd(7)); 
    let message = chalk[logCategory.text](args);

    let entry = `${start}${prefix}${message}`;

    let writer: Std = category === 'error' ? this.err : this.out;

    writer.write(entry);
    this.newLine(writer);
  }

  info(...args: unknown[]): void {
    this.write('info', args);
  }
  
  warn(...args: unknown[]): void {
    this.write('warn', args);
  }

  success(...args: unknown[]): void {
    this.write('success', args);
  }

  debug(...args: unknown[]): void {
    this.write('debug', args);
  }

  newLine(std: Std) {
    std.write(os.EOL);
  }

  writeStackTrace(err: Error | BundlerError) {
    if(!err.stack?.length) {
      return;
    }
    
    this.err.write(chalk.dim(err.stack));

    this.newLine(this.err);
  }

  writeFrame(err: BundlerError) {
    if(!err.frame) {
      return;
    }
    
    this.err.write(err.frame);
    this.newLine(this.err);
  }
  
  error(err: string | Error | BundlerError): void {
    if(typeof err === 'string') {
      this.write('error', err);
      return;
    }

    let description = err.name ? `${err.name}: ${err.message}` : err.message;

    this.write('error', description);

    if(!isBundlerError(err)){
      this.writeStackTrace(err);
      return;
    } 

    let loc = err.loc;

		if(hasFields(loc)) {
      this.err.write(`${(loc.file || err.id)} (${loc.line}:${loc.column})`)
      this.newLine(this.err);
			return;
    }
    
    this.writeFrame(err);

    this.writeStackTrace(err);
  }
}