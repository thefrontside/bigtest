import * as chokidar from 'chokidar';
import { Operation } from 'effection';
import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent } from '@effection/events';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  delegate: Mailbox;
  files: string[]; 
  destinationPath: string;
};

function* writeManifest(options: ManifestGeneratorOptions) {
  let files = yield globby(options.files);

  let manifest = 'let load = (res) => res.default || res;\n';
  manifest += 'const children = [\n';

  for(let file of files) {
    // path.posix.join is really the only thing that returns the real posix correctly
    // so we join with OS specific, split based on OS path separator and then rejoin it with
    // the path.posix.join method to get the real relative path in posix
    let filePath = "./" + path.posix.join(...path.relative(path.dirname(options.destinationPath), file).split(path.sep));
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
