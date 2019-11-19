import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Response } from 'node-fetch';

import { main } from '../src/main';
import { actions } from './helpers';

describe("server", () => {
  beforeEach(() => {
    actions.fork(main);
  });

  describe('connecting to the command server', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get('http://localhost:4000');
      body = await response.text();
    });

    it('responds successfully', () => {
      expect(response.ok).toEqual(true);
    });

    it('contains the ping text', () => {
      expect(body).toContain("Your wish is my command");
    });
  });
});
