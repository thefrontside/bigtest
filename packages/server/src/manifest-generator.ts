import * as chokidar from 'chokidar';
import { Operation } from 'effection';
import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent } from '@effection/events';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';
import { EslintValidator } from './validators/eslint-validator';
import { Validator, OrchestratorState, BundlerState } from './orchestrator/state';
import { Atom, Slice } from '@bigtest/atom';

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  delegate: Mailbox;
  files: string[]; 
  destinationPath: string;
  atom: Atom<OrchestratorState>;
};

type WriteManifestOptions = Omit<ManifestGeneratorOptions, 'atom' | 'delegate'> & { 
  validator: Validator;
  bundlerSlice: Slice<BundlerState, OrchestratorState>; 
};

function* writeManifest(options: WriteManifestOptions) {
  let { bundlerSlice, validator, destinationPath } = options;
  
  bundlerSlice.update(() => ({ type: 'VALIDATING' }));

  let files: string[] = yield globby(options.files);

  let validState = validator.validate(options.files);
  
  bundlerSlice.update(() => ({...validState}));
  
  let errors = validState.type === 'INVALID' ? validState.errors : [];

  let validFiles = files.flatMap(file => {
    // path.posix.join is really the only thing that returns the real posix correctly
    // so we join with OS specific, split based on OS path separator and then rejoin it with
    // the path.posix.join method to get the real relative path in posix
    let filePath = "./" + path.posix.join(...path.relative(path.dirname(destinationPath), file).split(path.sep));

    return !!errors.find(error => path.basename(error.fileName) === path.basename(file))
    ? [] 
    : [`Object.assign({}, load(require(${JSON.stringify(filePath)})), { path: ${JSON.stringify(file)} })`];
  });

  let manifest = 
`let load = (res) => res.default || res;

const children = [
  ${validFiles.join(', \n\t')}
];

module.exports = {
  description: "All tests",
  steps: [],
  assertions: [],
  children: children,
}
`;
  
  yield mkdir(path.dirname(destinationPath), { recursive: true });
  yield writeFile(destinationPath, manifest);
}

export function* createManifestGenerator(options: ManifestGeneratorOptions): Operation {
  let bundlerSlice = options.atom.slice('bundler');
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  let validator = new EslintValidator();

  yield ensure(() => watcher.close());

  let events: Mailbox = yield Mailbox.subscribe(watcher, ['ready', 'add', 'unlink']);

  yield throwOnErrorEvent(watcher);

  yield events.receive({ event: 'ready' });

  let writeOptions = { ...options, validator, bundlerSlice };
  
  yield writeManifest(writeOptions);

  console.debug("[manifest generator] manifest ready");
  options.delegate.send({ status: 'ready' });

  while(true) {
    yield events.receive();
    yield writeManifest(writeOptions);

    console.debug("[manifest generator] manifest updated");
    options.delegate.send({ event: 'update' });
  }
}
