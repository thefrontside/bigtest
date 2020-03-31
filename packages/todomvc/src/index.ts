import { express, Express } from '@bigtest/effection-express';
import * as xp from 'express';
import * as Path from 'path';

export function todomvc(): Express {
  let appDir = Path.join(__dirname, 'app');
  let app = express();

  app.use(xp.static(appDir));

  return app;
}
