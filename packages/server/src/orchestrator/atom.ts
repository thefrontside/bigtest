import { Atom } from "@bigtest/atom";
import { OrchestratorState } from "./state";
import { ProjectOptions } from '@bigtest/project/dist';
import path = require('path');

// TODO: eventually we can remove this type and just use ProjectOptions.
// But until then we can just pick the bits we need.
export type OrchestratorAtomOptions = Pick<ProjectOptions, 'app' |'watchTestFiles' | 'cacheDir' | 'testFiles'>

export const createOrchestratorAtom = (project: OrchestratorAtomOptions) => {
  let manifestSrcDir = path.resolve(project.cacheDir, 'manifest/src');
  let manifestSrcPath = path.resolve(manifestSrcDir, 'manifest.js');

  let atom = new Atom<OrchestratorState>({
    manifestGenerator: {
      status: { type: 'pending' },
      
      options: {
        destinationPath: manifestSrcPath,
        mode: project.watchTestFiles ? 'watch' : 'build',
        files: project.testFiles
      }
    },
    manifest: {
      description: "None",
      fileName: "<init>",
      steps: [],
      assertions: [],
      children: [],
    },
    bundler: {
      type: 'UNBUNDLED'
    },
    appService: {
      status: { type: 'pending' },
      options: project.app,
    },
    proxyService: {
      proxyStatus: 'unstarted'
    },
    agents: {},
    testRuns: {},
  });
  atom.setMaxListeners(100000);

  return atom;
}
