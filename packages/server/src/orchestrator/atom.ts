import { Atom } from "@bigtest/atom";
import { OrchestratorState } from "./state";
import { ProjectOptions } from '@bigtest/project/dist';
import path = require('path');
import { AgentServerConfig } from '@bigtest/agent';

// TODO: eventually we can remove this type and just use ProjectOptions.
// But until then we can just pick the bits we need.
export type OrchestratorAtomOptions = Pick<ProjectOptions, 'app' |'watchTestFiles' | 'cacheDir' | 'testFiles' | 'proxy'>

export const createOrchestratorAtom = (project: OrchestratorAtomOptions) => {
  let manifestSrcDir = path.resolve(project.cacheDir, 'manifest/src');
  let manifestSrcPath = path.resolve(manifestSrcDir, 'manifest.js');
  let agentServerConfig = new AgentServerConfig(project.proxy);

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
      status: {type: 'unstarted'},
      options: {
        port: project.proxy.port,
        prefix: agentServerConfig.options.prefix,
        appDir: agentServerConfig.appDir(),
        harnessUrl: agentServerConfig.harnessUrl(),
        // TODO: this is duplication because currently we can only pass 1 slice into a service
        // Is this problematic?
        appOptions: project.app
      }
    },
    connectionService: {
      status: {
        type: 'pending',
      },
      options: {}
    },
    agents: {},
    testRuns: {},
  });
  atom.setMaxListeners(100000);

  return atom;
}
