import { resource } from 'effection';
import { on, once } from '@effection/events';
import { Readable } from 'stream';

export class Stream {
  public output = "";

  static *of(value: Readable, verbose = false) {
    let testStream = new Stream(value, verbose);
    return yield resource(testStream, testStream.run());
  }

  constructor(private stream: Readable, private verbose = false) {};

  *run() {
    let events = yield on(this.stream, "data");
    while(true) {
      let { value: chunk } = yield events.next();
      this.output += chunk;
      if(this.verbose) {
        console.debug(chunk.toString());
      }
    }
  }

  *waitFor(text: string) {
    while(!this.output.includes(text)) {
      yield once(this.stream, "data");
    }
  }
}
