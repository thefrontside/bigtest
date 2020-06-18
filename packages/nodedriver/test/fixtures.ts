import { readyResource } from '@bigtest/effection';
import { express } from '@bigtest/effection-express';
import { static as staticMiddleware } from 'express';
import * as _fixtureManifest from '../../agent/test/fixtures/manifest.src';

export const fixtureManifest = _fixtureManifest;

export function* serveFixtureManifest(port: number) {
  let app = express();
  return yield readyResource(app, function*(ready) {
    app.use(staticMiddleware("../agent/test/fixtures"));
    yield app.listen(port);
    ready();
    yield;
  });
}
