import { Operation, withLabels } from 'effection';
import { Slice } from '@effection/atom';
import { express, Express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';
import { ManifestServerStatus } from './orchestrator/state';

interface ManifestServerOptions {
  status: Slice<ManifestServerStatus>;
  dir: string;
  port: number;
  proxyPort: number;
};

export const createManifestServer = (options: ManifestServerOptions): Operation<void> => withLabels(function*() {
  let app: Express = yield express();

  options.status.set({ type: 'starting' });

  app.raw.use(staticMiddleware(options.dir, {
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', `http://localhost:${options.proxyPort}`);
    }
  }));

  yield app.listen(options.port);

  options.status.set({ type: 'started' });

  yield
}, { name: 'manifestServer' });
