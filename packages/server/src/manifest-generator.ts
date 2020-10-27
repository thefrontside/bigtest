import * as chokidar from 'chokidar';
import { ensure } from '@bigtest/effection';
import { throwOnErrorEvent, once, on } from '@effection/events';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';
import { ManifestGeneratorOptions, Service } from './orchestrator/state';
import { assert } from './assertions/assert';
import { spawn } from 'effection';
import {Channel} from '@effection/channel';
import { subscribe } from '@effection/subscription';

const { writeFile, mkdir } = fs.promises;

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

export const manifestGenerator: Service<ManifestGeneratorOptions> = function *(options) {
  let { atom, files, mode } = options;

  assert(atom, 'No atom in manifestGenerator options');

  let serviceStatus = atom.slice('manifestGenerator', 'status');
  
  serviceStatus.set({ type: 'started' });

  if(mode === 'watch') {
    let watcher = chokidar.watch(files, { ignoreInitial: true });

    yield ensure(() => watcher.close());

    yield throwOnErrorEvent(watcher);

    yield once(watcher, 'ready');
    yield writeManifest(options);

    console.debug("[manifest generator] manifest ready, watching for updates")

    serviceStatus.update(() => ({ type: 'reachable' }));
    
    let fileChanges = new Channel<void>();

    let writeOperation = function *() {
      fileChanges.send();
      console.debug("[manifest generator] manifest updated");
      serviceStatus.update(() => ({ type: 'reachable' }))
    }

    yield spawn(on(watcher, 'add').forEach(writeOperation));
    yield spawn(on(watcher, 'unlink').forEach(writeOperation));
    
    yield subscribe(fileChanges).forEach(() => writeManifest(options));
  } else {
    yield writeManifest(options);
    serviceStatus.update(() => ({ type: 'reachable' }));
  }
}
