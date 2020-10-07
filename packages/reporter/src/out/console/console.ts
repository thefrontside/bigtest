import { Out, OutOptions, Std, LogCategory } from '../../types';
import { logCategories, ExtendedStackFrame } from './types';
import chalk from 'chalk';
import os from 'os';
import { isBundlerError, hasFields } from '../../utils';
import { codeFrameColumns } from '@babel/code-frame';
import fs from 'fs';
import path from 'path';
import { wrapCallSite } from "source-map-support";
import { getCallSites } from '../../error/call-sites-helper';
import { wrapStackFrame } from '../../error/stack';

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
    this.out.write(
      process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
    );
  }

  printStack(stack: ExtendedStackFrame[]) {
    for(let frame of stack) {
      this.err.write(chalk.gray("• "));

      if (frame.fileName) {
        this.err.write(chalk.yellowBright(frame.fileName));
      }

      if (frame.lineNumber) {
        this.err.write(chalk.gray(":"));
        this.err.write(chalk.yellow(frame.lineNumber));
      }

      this.err.write(chalk.white(" " + (frame.functionName ?? "<anonymous>")));

      if (
        !!frame.filePath &&
        !!frame.lineNumber &&
        !!frame.columnNumber
      ) {
        this.err.write("\n    ");
        this.err.write(path.normalize(
            chalk.gray(`${frame.filePath}:${frame.lineNumber}:${frame.columnNumber}`)
          )
        );
      }
      this.newLine(this.err);
      this.newLine(this.err);
    }

    this.newLine(this.err);
  }

  printStackTrace(error: Error) {
    let errorCallSites = getCallSites(error) || [];
  
    let stack = Object.values(errorCallSites).map(frame => wrapStackFrame(wrapCallSite(frame)));

    this.printStack(stack);
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(error: any) {
    this.newLine(this.err);
    
    if(typeof error === 'string') {
      this.write('error', error);
      return;
    }

    let description = error.name ? `${error.name}: ${error.message}` : error.message;

    this.write('error', description);
    
    if(!isBundlerError(error) && error.stack){
      this.printStack(error);
      return;
    } 
    
    let loc = error.loc;

    
    if (hasFields(loc)) {
      this.newLine(this.err);
      let {file, line, column} = loc;
      let rawLines = fs.readFileSync(file, 'utf-8');
      
      let frame = codeFrameColumns(rawLines, 
        { start: { line, column: column + 1 }},
        { highlightCode: true }
      );
     
      this.err.write(frame + '\n');
      this.newLine(this.err);
    } else if (error.codeFrame) {
      this.err.write(error.codeFrame);
    }

    this.printStackTrace(error);
  }
}