import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import { Button, Heading, Link } from 'bigtest';

describe('Interactor with Jest', () => {
  beforeEach(() => {
    render(<App />);
  });
  it('click sign in button', async () => {
    await Button('SIGN IN').click();
    await Button('SIGN IN').absent();
    await Button('LOG OUT').exists();
  });
  it('navigate to about page', async () => {
    await Link('/about').click();
    await Heading('About page').exists();
  });
});
