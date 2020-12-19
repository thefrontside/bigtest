import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import { Button } from 'bigtest';

describe('Interactor with Jest', () => {
  beforeEach(() => render(<App />))
  it('displays submitted data from modal', async () => {
    await Button('SIGN IN').click();
  });
});
