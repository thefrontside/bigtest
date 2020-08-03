import * as chokidar from 'chokidar';
import { Operation } from 'effection';
import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent } from '@effection/events';
import * as fs from 'fs';
<<<<<<< HEAD
import * as path from 'path';
import * as globby from 'globby';
=======
// import * as glob from 'glob';
import * as path from 'path';
import * as globby from 'globby';
// import { promisify } from 'util';
>>>>>>> create assumptions doc

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  delegate: Mailbox;
  files: string[]; 
  destinationPath: string;
};

function* writeManifest(options: ManifestGeneratorOptions) {
<<<<<<< HEAD
=======
  // let files = yield Promise.all(options.files.map((pattern) => promisify(glob)(pattern))).then((l) => l.flat());
>>>>>>> create assumptions doc
  let files = yield globby(options.files);

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
  throw new Error(manifest)
  yield writeFile(options.destinationPath, manifest);
}

export function* createManifestGenerator(options: ManifestGeneratorOptions): Operation {
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  yield ensure(() => watcher.close());

  let events: Mailbox = yield Mailbox.subscribe(watcher, ['ready', 'add', 'unlink']);

  yield throwOnErrorEvent(watcher);

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
}
