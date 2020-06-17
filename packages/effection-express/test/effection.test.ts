import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';
import fetch, { Response } from 'node-fetch';

import { main, Context, Controls } from 'effection';

import { Express, express } from '../src/index';

describe('express', () => {
  let app: Express;
  let world: Context & Controls;

  beforeEach(async () => {
    world = main(undefined) as Context & Controls;

    app = express();

    await world.spawn(app.use(function*(req, res) {
      res.send("hello");
      res.end();
    }));

    await world.spawn(app.listen(26000));
  });

  afterEach(() => {
    world.halt();
  });

  describe('sending requests to the express app', () => {
    let response: Response;
    let text: string;

    beforeEach(async () => {
      response = await fetch("http://localhost:26000");
      text = await response.text();
    });

    it('contains response text from express', () => {
      expect(response.status).toEqual(200);
      expect(text).toEqual("hello");
    });
  });
});
