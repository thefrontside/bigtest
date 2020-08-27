import { Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';

interface ManifestServerOptions {
  delegate: Mailbox;
  dir: string;
  port: number;
  proxyPort: number;
};

export function* createManifestServer(options: ManifestServerOptions): Operation {
  let app = express();

  app.raw.use(staticMiddleware(options.dir, {
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', `http://localhost:${options.proxyPort}`);
    }
  }));

  yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield
}
