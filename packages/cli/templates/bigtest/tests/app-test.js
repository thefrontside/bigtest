import { expect } from 'chai';
import { beforeEach, describe, it } from '@bigtest/mocha';
import { setupApplicationForTesting } from '../helpers/setup-app';

import AppInteractor from '../interactors/app.js';

describe('Your application', () => {
  let App = new AppInteractor();

  beforeEach(async () => {
    await setupApplicationForTesting();
  });

  it('has an h1', () => {
    expect(App.hasHeading).to.equal(true);
  });
});
