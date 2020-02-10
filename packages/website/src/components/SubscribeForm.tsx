import React, { useState } from 'react';
import styled from 'styled-components';
import addToMailChimp from 'gatsby-plugin-mailchimp';

interface DisableForm {
  disabled: boolean;
}

const Button = styled.button<DisableForm>`
  border-radius: ${({ theme }) => theme.space.small};
  padding: ${({ theme }) => theme.space.medium} ${({ theme }) => theme.space.large};
  margin-left: ${({ theme }) => theme.space.small};
  background: ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.background};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-family: ${({ theme }) => theme.fonts.heading};
  cursor: pointer;
  &:hover {
    background: ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.colors.secondary)};
  }
`;

const Input = styled.input<DisableForm>`
  border-radius: ${({ theme }) => theme.space.small};
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.space.small} ${({ theme }) => theme.space.medium};
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  border: 2px solid ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.fontSizes.primary)};
  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
    outline: none;
  }
`;

interface SubscribeForm {
  id: number;
}

const Subscribe: React.FC<SubscribeForm> = props => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [botfield, preventSpam] = useState('');

  const reset = () => {
    setSent(true), setEmail('');
  };

  const handleSubmit = e => {
    e.preventDefault();

    addToMailChimp(e.target.email.value)
      .then(reset())
      .catch(error => alert(error));
  };

  const email_ID = `email${props.id}`;

  return (
    <form
      name="newsletter"
      method="post"
      style={{ display: 'flex' }}
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
        id={email_ID}
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
  );
};

export default Subscribe;
