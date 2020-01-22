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
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  try {
    yield watch(watcher, ['ready', 'add', 'unlink']);
    yield watchError(watcher);

    yield receive({ event: 'ready' });
    yield writeManifest(options);

    orchestrator.send({ ready: "manifest" });

    while(true) {
      yield receive();
      yield writeManifest(options);

      orchestrator.send({ change: "manifest" });
    }
  } finally {
    watcher.close();
  }
}
