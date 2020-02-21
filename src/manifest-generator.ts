import * as chokidar from 'chokidar';
import { Operation } from 'effection';
import { watchError, Mailbox } from '@effection/events';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  delegate: Mailbox;
  files: [string];
  manifestPath: string;
};

function* writeManifest(options: ManifestGeneratorOptions) {
  let files = yield Promise.all(options.files.map((pattern) => promisify(glob)(pattern))).then((l) => l.flat());

  let manifest = "const entries = [\n";

  for(let file of files) {
    let filePath = "./" + path.relative(path.dirname(options.manifestPath), file);
    manifest += `  { path: ${JSON.stringify(file)}, test: require(${JSON.stringify(filePath)}).default },\n`;
  }

  manifest += "];\n";
  manifest +=
`
module.exports = {
  sources: entries.map(({ path }) => path),
  suite: {
    description: "All Tests",
    steps: [],
    assertions: [],
    children: entries.map(({ test }) => test),
  }
}
`

  yield mkdir(path.dirname(options.manifestPath), { recursive: true });
  yield writeFile(options.manifestPath, manifest);
}

export function* createManifestGenerator(options: ManifestGeneratorOptions): Operation {
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  try {
    let events: Mailbox = yield Mailbox.watch(watcher, ['ready', 'add', 'unlink']);

    yield watchError(watcher);

    yield events.receive({ event: 'ready' });
    yield writeManifest(options);

    console.debug("[manifest generator] manifest ready");
    options.delegate.send({ status: 'ready' });

    while(true) {
      yield events.receive();
      yield writeManifest(options);

      console.debug("[manifest generator] manifest updated");
      options.delegate.send({ event: 'update' });
    }
  } finally {
    watcher.close();
  }
}
