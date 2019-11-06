import * as fs from 'fs';
import { EventEmitter } from '@effection/events';

export function watch(filename: string, options) {
  return new FileWatcher(fs.watch(filename, options));
}

class FileWatcher extends EventEmitter<fs.FSWatcher, "change"> {
  close() {
    this.inner.close();
  }
}
