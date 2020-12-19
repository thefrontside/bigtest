import { Operation } from 'effection';
import { Slice } from '@bigtest/atom';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';
import { OrchestratorState } from './orchestrator/state';

interface ManifestServerOptions {
  dir: string;
  port: number;
  proxyPort: number;
  atom: Slice<OrchestratorState>;
};

export function* createManifestServer(options: ManifestServerOptions): Operation {
  let status = options.atom.slice('manifestServer', 'status');
  let app = express();

  status.set({ type: 'starting' });

  app.raw.use(staticMiddleware(options.dir, {
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', `http://localhost:${options.proxyPort}`);
    }
  }));

  yield app.listen(options.port);

  status.set({ type: 'started' });

  yield
}
