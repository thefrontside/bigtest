import * as chokidar from 'chokidar';
import { ensure } from '@bigtest/effection';
import { throwOnErrorEvent, once, on } from '@effection/events';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';
import { ManifestGeneratorOptions, ManifestGeneratorStatus, Service } from './orchestrator/state';
import { spawn } from 'effection';
import {Channel} from '@effection/channel';
import { subscribe } from '@effection/subscription';
import { assert } from 'assert-ts';

const { writeFile, mkdir } = fs.promises;

type WriteOptions = Required<Pick<ManifestGeneratorOptions, 'files' | 'destinationPath'>>;

function* writeManifest({ files, destinationPath }: WriteOptions) {
  let testFiles = yield globby(files);

  let manifest = 'let load = (res) => res.default || res;\n';
  manifest += 'const children = [\n';

  for(let file of testFiles) {
    // path.posix.join is really the only thing that returns the real posix correctly
    // so we join with OS specific, split based on OS path separator and then rejoin it with
    // the path.posix.join method to get the real relative path in posix
    let filePath = "./" + path.posix.join(...path.relative(path.dirname(destinationPath), file).split(path.sep));
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
  yield mkdir(path.dirname(destinationPath), { recursive: true });
  yield writeFile(destinationPath, manifest);
}

export const manifestGenerator: Service<ManifestGeneratorStatus, ManifestGeneratorOptions> = function *(serviceStatus, options) {
  assert(!!options.files, 'no files options in ManifestGeneratorOptions');
  assert(!!options.destinationPath, 'no destinationApth in ManifestGeneratorOptions');

  let { files, mode, destinationPath } = options;

  let writeOptions: WriteOptions = { files, destinationPath } as const;

  serviceStatus.set({ type: 'pending' });

  if(mode === 'watch') {
    let watcher = chokidar.watch(files, { ignoreInitial: true });

    yield ensure(() => watcher.close());

    yield throwOnErrorEvent(watcher);

    yield once(watcher, 'ready');
    yield writeManifest({ files, destinationPath });

    console.debug("[manifest generator] manifest ready, watching for updates")

    serviceStatus.update(() => ({ type: 'ready' }));
    
    let fileChanges = new Channel<void>();

    let writeOperation = function *() {
      fileChanges.send();
      console.debug("[manifest generator] manifest updated");
      serviceStatus.update(() => ({ type: 'ready' }))
    }

    yield spawn(on(watcher, 'add').forEach(writeOperation));
    yield spawn(on(watcher, 'unlink').forEach(writeOperation));
    
    yield subscribe(fileChanges).forEach(() => writeManifest(writeOptions));
  } else {
    yield writeManifest(writeOptions);
    serviceStatus.update(() => ({ type: 'ready' }));
  }
}
