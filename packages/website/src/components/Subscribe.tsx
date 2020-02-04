import React, { useState } from 'react';
import styled from 'styled-components';

import { Strong } from './Text';

interface DisableForm {
  disabled: boolean;
}

const SubscribeContainer = styled.div`
  margin-top: ${({ theme }) => theme.space.large};
`;

const Button = styled.button<DisableForm>`
  border-radius: ${({ theme }) => theme.space.small};
  padding: ${({ theme }) => theme.space.medium} ${({ theme }) => theme.space.large};
  margin-left: ${({ theme }) => theme.space.small};
  background: ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.background};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Input = styled.input<DisableForm>`
  border-radius: ${({ theme }) => theme.space.small};
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.space.small} ${({ theme }) => theme.space.medium};
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  border: 2px solid ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.fontSizes.primary)};
`;

function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

interface SubscribeText {
  text: string;
}

const Subscribe: React.FC<SubscribeText> = props => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [botfield, preventSpam] = useState('');

  const reset = () => {
    setSent(true), setEmail('');
  };

  const handleSubmit = e => {
    e.preventDefault();

    const form = e.target;
    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encode({
        'form-name': form.getAttribute('name'),
        email,
      }),
    })
      .then(() => reset())
      .catch(error => alert(error));
  };

  return (
    <SubscribeContainer>
      <Strong>{props.text}</Strong>
      <form
        name="newsletter"
        method="post"
        style={{ display: 'flex' }}
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <div hidden>
          <label>
            Don’t fill this out:
            <input name="bot-field" onChange={e => preventSpam(e.target.value)} value={botfield} />
          </label>
        </div>
        <Input
          id="email"
          name="email"
          onChange={e => setEmail(e.target.value)}
          required={true}
          type="email"
          value={email}
          placeholder={
            sent
              ? 'Your email has been successfully submitted!'
              : "Your email (we'll send max 1 email per month, no spam)"
          }
          disabled={sent}
        />
        <Button type="submit" disabled={sent}>
          Subscribe
        </Button>
      </form>
    </SubscribeContainer>
  );
};

export default Subscribe;
