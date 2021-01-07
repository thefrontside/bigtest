import { express, Express } from '@bigtest/effection-express';
import xp from 'express';
import Path from 'path';

export function todomvc(): Express {
  let appDir = Path.join(__dirname, 'app');
  let app = express();

  app.raw.use(xp.static(appDir));

  return app;
}
