import React, { useState } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  border-radius: var(--space-half);
  padding: var(--space-half) var(--space-one-half);
  margin-left: calc(var(--space-single) * 0.75);
  font-size: var(--size-med-sm);
  background: ${props => (props.disabled ? 'grey' : 'var(--button-color)')};
  color: white;
  font-weight: bold;
`;

const Input = styled.input`
  border-radius: var(--space-half);
  background: var(--body-bg);
  padding: var(--space-single) var(--space-half);
  width: 100%;
  color: var(--input-color);
  font-size: var(--size-med-sm);
  border: 2px solid;
  border-color: ${props =>
    props.disabled ? 'silver' : 'var(--input-border-color)'};
`;

const P1 = styled.p`
  font-weight: 700;
  color: var(--color-dark-blue);
  margin-top: var(--space-triple);
  font-size: var(--size-med-sm);
`;

function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

interface SubscribeText {
  text: string;
}

const Subscribe: React.FC<SubscribeText> = (props) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [botfield, preventSpam] = useState('');

  const reset = () => {
    setSent(true),
      setEmail('')
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
      .then(() =>
        reset(),
      )
      .catch(error => alert(error));
  }

  return (
    <div>
      <P1>{props.text}</P1>
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
    </div>
  )
}

export default Subscribe;
