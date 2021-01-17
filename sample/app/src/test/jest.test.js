import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import { Button } from 'bigtest';

describe('Interactor with Jest', () => {
  it('displays submitted data from modal', async () => {
    render(<App />)
    await Button('SIGN IN').click();
  });
});
