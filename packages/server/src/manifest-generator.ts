import * as chokidar from 'chokidar';
import { Operation, spawn } from 'effection';
import { Mailbox, ensure } from '@bigtest/effection';
import { throwOnErrorEvent } from '@effection/events';
import * as fs from 'fs';
import * as globby from 'globby';
import * as path from 'path';
import { EslintValidator } from './validators/eslint-validator';
import { OrchestratorState, BundlerState } from './orchestrator/state';
import { Atom, Slice } from '@bigtest/atom';
import { assertBundlerState } from './assertions/bundler-assertions';

const { writeFile, mkdir } = fs.promises;

interface ManifestGeneratorOptions {
  files: string[]; 
  destinationPath: string;
  atom: Atom<OrchestratorState>;
};

type WriteManifestOptions = Omit<ManifestGeneratorOptions, 'atom'> & { 
  bundlerSlice: Slice<BundlerState, OrchestratorState>; 
};

const Validators = [EslintValidator];

function *runValidations(files: string[]): Operation<BundlerState> {
  let validations: BundlerState[] = []

  for (let validator of Validators.map(V => new V())) {
    validations.push(yield spawn(validator.validate(files)));
  }

  let results: BundlerState[] = yield Promise.all(validations);
  
  let [warnings, errors] = results.flatMap(v =>
    v.type === 'VALID' 
    ? [v.warnings ?? [], []]
    : v.type === 'INVALID'
    ? [v.warnings ?? [], v.errors] 
    : []
  );

  return errors.length === 0 
    ? { type: 'VALID', warnings } as const
    : { type: 'INVALID', errors, warnings } as const;
}

function* writeManifest(options: WriteManifestOptions) {
  let { bundlerSlice, destinationPath } = options;

  bundlerSlice.update(() => ({ type: 'VALIDATING' }));

  let nextBundlerState: BundlerState = yield runValidations(options.files);
 
  let files: string[] = yield globby(options.files);

  let errors = nextBundlerState.type === 'INVALID' ? nextBundlerState.errors : [];
 
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

  bundlerSlice.update(() => ({...nextBundlerState}));
}

export function* createManifestGenerator(options: ManifestGeneratorOptions): Operation {
  let bundlerSlice = options.atom.slice('bundler');
  let watcher = chokidar.watch(options.files, { ignoreInitial: true });

  yield ensure(() => watcher.close());

  let events: Mailbox = yield Mailbox.subscribe(watcher, ['ready', 'add', 'unlink']);

  yield throwOnErrorEvent(watcher);

  yield events.receive({ event: 'ready' });

  let writeOptions = { ...options, bundlerSlice };
  
  yield writeManifest(writeOptions);

  if(bundlerSlice.get().type === 'INVALID') {
    bundlerSlice.update(() => ({...bundlerSlice.get()}));
    // TODO: what do we do in an INVALID state
    return;
  }

  console.debug("[manifest generator] manifest ready");
  bundlerSlice.update((prev) => {
    assertBundlerState(prev.type, { is: [ 'VALID' ] });

    return { type: 'BUILDING', warnings: prev.warnings };
  });

  while(true) {
    yield events.receive();
    yield writeManifest(writeOptions);

    if(bundlerSlice.get().type === 'INVALID') {
      bundlerSlice.update(() => ({...bundlerSlice.get()}));
      // TODO: what do we do in an INVALID state
      return;
    }

    console.debug("[manifest generator] manifest updated");
    bundlerSlice.update((prev) => {
      assertBundlerState(prev.type, { is: [ 'VALID', 'BUILDING', 'GREEN' ] });
  
      return { type: 'UPDATE', warnings: prev.warnings };
    });
  }
}
