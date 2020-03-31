import { Operation } from 'effection';
import { Mailbox, express } from '@bigtest/effection';
import { static as staticMiddleware } from 'express';

interface ManifestServerOptions {
  delegate: Mailbox;
  dir: string;
  port: number;
};

export function* createManifestServer(options: ManifestServerOptions): Operation {
  let app = express();

  app.use(staticMiddleware(options.dir));

  yield app.listen(options.port);

  options.delegate.send({ status: "ready" });

  yield
}
