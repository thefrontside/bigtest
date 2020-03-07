import { EventEmitter } from 'events';
import { Operation } from 'effection'
import { ensure, suspend, once } from '@bigtest/effection';

import { Variable } from './variable';

export const CtrlC: KeyStroke = ({ input, key }) => input === 'c' && key.ctrl;
export const TAB: KeyStroke = ({ input, key }) => input === 'i' && key.ctrl;
export const ShiftTAB: KeyStroke = ({ input, key }) => input === '[Z' && key.meta;

export const KeyEvents = new Variable<KeyEventLoop>('KeyEvents');

export interface KeyStroke {
  (event: KeyEvent): boolean;
}

export interface KeyEvent {
  key: {
    upArrow: boolean;
    downArrow: boolean;
    leftArrow: boolean;
    rightArrow: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    meta: boolean;
  };
  input: string;
}

export class KeyEventLoop {
  subscriptions: EventEmitter = new EventEmitter();
  static *create(stdin: NodeJS.ReadStream): Operation {
    let rawMode = stdin.isRaw;
    stdin.setRawMode(true);

    let events = new KeyEventLoop();

    let handleData = (data: unknown) => {
      let input = String(data);
      let key = {
        upArrow: input === '\u001B[A',
        downArrow: input === '\u001B[B',
        leftArrow: input === '\u001B[D',
        rightArrow: input === '\u001B[C',
        return: input === '\r',
        escape: input === '\u001B',
        ctrl: false,
        shift: false,
        meta: false
      };

      // Copied from `keypress` module
      if (input <= '\u001A' && !key.return) {
        input = String.fromCharCode(input.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
        key.ctrl = true;
      }

      if (input[0] === '\u001B') {
        input = input.slice(1);
        key.meta = true;
      }

      let isLatinUppercase = input >= 'A' && input <= 'Z';
      let isCyrillicUppercase = input >= 'А' && input <= 'Я';
      if (input.length === 1 && (isLatinUppercase || isCyrillicUppercase)) {
        key.shift = true;
      }

      events.subscriptions.emit('input', { input, key });
    };

    stdin.on('data', handleData);

    yield suspend(ensure(() => {
      stdin.off('data', handleData);
      stdin.unref();
      stdin.setRawMode(rawMode);
    }));


    return events;
  }

  *on(match: KeyStroke): Operation {
    while (true) {
      let event = yield this.next();
      if (match(event)) {
        return event;
      }
    }
  }

  *next(): Operation {
    let [event] = yield once(this.subscriptions, 'input');
    return event;
  }
}
