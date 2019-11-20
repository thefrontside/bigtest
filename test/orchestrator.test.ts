import { describe, beforeEach, it } from 'mocha';
import * as expect from 'expect';

import { Response } from 'node-fetch';

import { actions } from './helpers';

describe("orchestrator", () => {
  beforeEach(() => {
    actions.startOrchestrator();
  });

  describe('connecting to the command server', () => {
    let response: Response;
    let body: string;
    beforeEach(async () => {
      response = await actions.get('http://localhost:24102');
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
