import { Operation } from 'effection';
import { express, Express } from '@bigtest/effection';
import * as xp from 'express';
import * as Path from 'path';

export function *todomvc(port: number): Operation<Express> {
  let appDir = Path.join(__dirname, 'app');
  let app = express();

  app.use(xp.static(appDir));

  return yield app.listen(port);
}
