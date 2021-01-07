import { resource, Operation, Context } from 'effection';
import { subscribe } from '@effection/subscription';
import { Channel } from '@effection/channel';

import { World } from './world';

export class Stream {
  public output = "";
  private semaphore = new Channel<true>();
  append = (chunk: string): string => this.output += chunk;

  static *of(channel: Channel<string>, verbose = false): Operation<Stream> {
    let testStream = new Stream(channel, verbose);
    return yield resource(testStream, testStream.run());
  }

  constructor(private channel: Channel<string>, private verbose = false) {}

  *run(): Operation<void> {
    let { semaphore, verbose, append } = this;
    yield subscribe(this.channel).forEach(function*(chunk) {
      append(chunk);
      semaphore.send(true);
      if (verbose) {
        process.stdout.write(chunk);
      }
    });
  }

  *waitFor(text: string): Operation<void> {
    let subscription = yield subscribe(this.semaphore);
    while(!this.output.includes(text)) {
      yield subscription.next();
    }
    return;
  }

  detect(text: string): Context<void> {
    return World.spawn(this.waitFor(text));
  }
}
