import chokidar from 'chokidar';
import { Slice } from '@effection/atom';
import { throwOnErrorEvent, once, on, spawn, ensure } from 'effection';
import fs from 'fs';
import globby from 'globby';
import path from 'path';
import { ManifestGeneratorStatus } from './orchestrator/state';
import { Operation, createChannel } from 'effection';
import { assert } from 'assert-ts';

const { writeFile, mkdir } = fs.promises;

type WriteOptions = Required<Pick<ManifestGeneratorOptions, 'files' | 'destinationPath'>>;

function* writeManifest({ files, destinationPath }: WriteOptions): Operation<void> {
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

export interface ManifestGeneratorOptions {
  status: Slice<ManifestGeneratorStatus>;
  files?: string[];
  mode: 'idle' | 'watch' | 'build';
  destinationPath?: string;
};

export function* manifestGenerator(options: ManifestGeneratorOptions): Operation<void> {
  assert(!!options.files, 'no files options in ManifestGeneratorOptions');
  assert(!!options.destinationPath, 'no destinationPath in ManifestGeneratorOptions');

  let { files, mode, destinationPath } = options;

  let writeOptions: WriteOptions = { files, destinationPath } as const;

  options.status.set({ type: 'pending' });

  if(mode === 'watch') {
    let watcher = chokidar.watch(files, { ignoreInitial: true });

    yield ensure(() => watcher.close());
    yield spawn(throwOnErrorEvent(watcher));

    yield once(watcher, 'ready');
    yield writeManifest({ files, destinationPath });

    console.debug("[manifest generator] manifest ready, watching for updates")

    options.status.update(() => ({ type: 'ready' }));

    let fileChanges = createChannel<void>();

    let writeOperation = () => function*() {
      fileChanges.send();
      console.debug("[manifest generator] manifest updated");
      options.status.update(() => ({ type: 'ready' }))
    }

    yield spawn(on(watcher, 'add').forEach(writeOperation));
    yield spawn(on(watcher, 'unlink').forEach(writeOperation));

    yield fileChanges.forEach(() => writeManifest(writeOptions));
  } else {
    yield writeManifest(writeOptions);
    options.status.update(() => ({ type: 'ready' }));
  }
}
