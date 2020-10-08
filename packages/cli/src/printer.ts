import * as os from 'os';
import * as chalk from 'chalk';
import { Writable } from 'stream';

type Color = 'red' | 'grey' | 'white' | 'yellow' | 'green';

export class Printer {
  constructor(public stream: Writable, public linePrefix = '', public colorValue?: Color) {
  }

  write(...text: string[]) {
    let result = text.join('').split(/\r?\n(?!$)/).map((l) => this.linePrefix + l).join(os.EOL).replace(/\r?\n$/, os.EOL);
    if(this.colorValue) {
      result = chalk[this.colorValue](result);
    }
    this.stream.write(result);
  }

  line(...lines: string[]) {
    this.write(lines.join(os.EOL) + os.EOL);
  }

  words(...words: (string | undefined)[]) {
    this.write(words.filter(Boolean).join(' '), os.EOL);
  }

  prefix(newPrefix: string): Printer {
    return new Printer(this.stream, this.linePrefix + newPrefix, this.colorValue);
  }

  indent(count = 1): Printer {
    return this.prefix('  '.repeat(count));
  }

  color(value: Color): Printer {
    return new Printer(this.stream, this.linePrefix, value);
  }

  get red() { return this.color('red'); }
  get grey() { return this.color('grey'); }
  get white() { return this.color('white'); }
  get yellow() { return this.color('yellow'); }
  get green() { return this.color('green'); }
}
