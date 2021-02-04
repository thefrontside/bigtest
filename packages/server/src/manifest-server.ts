import { Operation } from 'effection';
import { Slice } from '@bigtest/atom';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';
import { ManifestServerStatus } from './orchestrator/state';

interface ManifestServerOptions {
  status: Slice<ManifestServerStatus>;
  dir: string;
  port: number;
  proxyPort: number;
};

export function* createManifestServer(options: ManifestServerOptions): Operation {
  let app = express();

  options.status.set({ type: 'starting' });

  app.raw.use(staticMiddleware(options.dir, {
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', `http://localhost:${options.proxyPort}`);
    }
  }));

  yield app.listen(options.port);

  options.status.set({ type: 'started' });

  yield
}
