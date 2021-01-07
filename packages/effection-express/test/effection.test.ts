import { describe, beforeEach, it } from 'mocha';
import expect from 'expect';
import fetch, { Response } from 'node-fetch';

import { run } from './helpers';
import { Express, express } from '../src/index';

describe('express', () => {
  let app: Express;

  beforeEach(async () => {

    app = express();

    await run(app.use(function*(_, res) {
      res.send("hello");
      res.end();
    }));

    await run(app.listen(26000));
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
