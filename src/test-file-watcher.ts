import * as chokidar from 'chokidar';
import { receive, Sequence, Execution } from 'effection';
import { watch, watchError } from '@effection/events';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';

const { writeFile } = fs.promises;

interface TestFileWatcherOptions {
  files: [string];
  manifestPath: string;
};

function globWatcherController(files: [string]) {
  return (execution) => {
    let watcher = chokidar.watch(files, { ignoreInitial: true });

    execution.atExit(() => watcher.close());
    execution.resume(watcher);
  }
}

function* writeManifest(options: TestFileWatcherOptions) {
  let files = yield Promise.all(options.files.map((pattern) => promisify(glob)(pattern))).then((l) => l.flat());

  let manifest = "module.exports = [\n";

  for(let file of files) {
    let filePath = "./" + path.relative(path.dirname(options.manifestPath), file);
    manifest += `  { path: ${JSON.stringify(file)}, test: require(${JSON.stringify(filePath)}) },\n`;
  }

  manifest += "];\n";

  yield writeFile(options.manifestPath, manifest);
}

export function* createTestFileWatcher(orchestrator: Execution, options: TestFileWatcherOptions): Sequence {
  let watcher = yield globWatcherController(options.files);

  yield watchError(watcher);
  yield watch(watcher, 'add');
  yield watch(watcher, 'unlink');

  yield writeManifest(options);

  orchestrator.send({ ready: "manifest" });

  while(true) {
    yield receive();
    yield writeManifest(options);

    orchestrator.send({ change: "manifest" });
  }
}
