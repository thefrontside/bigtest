import * as chokidar from 'chokidar';
import { Operation } from 'effection';
import { watchError } from './effection/events'; //TODO: use monitorErrors from @bigtest/effection
import { Mailbox } from '@bigtest/effection';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  delegate: Mailbox;
  files: [string];
  destinationPath: string;
};

function* writeManifest(options: ManifestGeneratorOptions) {
  let files = yield Promise.all(options.files.map((pattern) => promisify(glob)(pattern))).then((l) => l.flat());

  let manifest = 'let load = (res) => res.default || res;\n';
  manifest += 'const children = [\n';

  for(let file of files) {
    let filePath = "./" + path.relative(path.dirname(options.destinationPath), file);
    manifest += `  Object.assign({}, load(require(${JSON.stringify(filePath)})), { path: ${JSON.stringify(file)} }),\n`;
  }

  manifest += "];\n";
  manifest +=
`
module.exports = {
  description: "All tests",
  steps: [],
  assertions: [],
  children: children,
}
`

  yield mkdir(path.dirname(options.destinationPath), { recursive: true });
  yield writeFile(options.destinationPath, manifest);
}

export function* createManifestGenerator(options: ManifestGeneratorOptions): Operation {
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  try {
    let events: Mailbox = yield Mailbox.subscribe(watcher, ['ready', 'add', 'unlink']);

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
