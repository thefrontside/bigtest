import os from 'os';
import chalk from 'chalk';
import { Writable } from 'stream';

type Color = 'red' | 'grey' | 'white' | 'yellow' | 'green' | 'blue';

export class Printer {
  constructor(public stream: Writable, public basePrefix = '', public trailingPrefix = basePrefix, public colorValue?: Color) {
  }

  write(...text: string[]): void {
    let result = text.join('').split(/\r?\n(?!$)/).map((l, index) => (index === 0 ? this.basePrefix : this.trailingPrefix) + l).join(os.EOL).replace(/\r?\n$/, os.EOL);
    if(this.colorValue) {
      result = chalk[this.colorValue](result);
    }
    this.stream.write(result);
  }

  line(...lines: string[]): void {
    this.write(lines.join(os.EOL) + os.EOL);
  }

  words(...words: (string | undefined)[]): void {
    this.write(words.filter(Boolean).join(' '), os.EOL);
  }

  prefix(basePrefix: string, trailingPrefix = basePrefix): Printer {
    return new Printer(this.stream, this.basePrefix + basePrefix, this.trailingPrefix + trailingPrefix, this.colorValue);
  }

  indent(count = 1): Printer {
    return this.prefix('  '.repeat(count));
  }

  color(value: Color): Printer {
    return new Printer(this.stream, this.basePrefix, this.trailingPrefix, value);
  }

  get red(): Printer { return this.color('red'); }
  get grey(): Printer { return this.color('grey'); }
  get white(): Printer { return this.color('white'); }
  get yellow(): Printer { return this.color('yellow'); }
  get green(): Printer { return this.color('green'); }
  get blue(): Printer { return this.color('blue'); }
}
