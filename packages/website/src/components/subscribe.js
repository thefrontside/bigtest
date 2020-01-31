import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  border-radius: var(--space-half);
  padding: var(--space-half) var(--space-one-half);
  margin-left: calc(var(--space-single)*.75);
  font-size: var(--size-med-sm);
  background: ${props => props.disabled ? "grey" : "var(--button-color)"};
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
  border-color: ${props => props.disabled ? "silver" : "var(--input-border-color)"};
`;

const P1 = styled.p`
  font-weight: 700;
  color: var(--color-dark-blue);
  margin-top: var(--space-triple);
  font-size: var(--size-med-sm);
`;

const P2 = styled.p`
  color: var(--color-dark-blue);
`;

function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

export default class Subscribe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      input: false
    };
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const form = e.target;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': form.getAttribute('name'),
        'email': this.state.email,
      }),
    })
      .then(() => this.setState({ input: true, email: "" }))
      .catch(error => alert(error));
  };

  render() {
    return (
      <div>
        {this.props.bold ? <P1>{this.props.text}</P1> : <P2>{this.props.text}</P2>}
        <form
          name="newsletter"
          method="post"
          style={{ display: "flex" }}
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={this.handleSubmit}
        >
          <input type="hidden" name="form-name" value="newsletter" />
          <div hidden>
            <label>
              Don’t fill this out:{' '}
              <input name="bot-field" onChange={this.handleChange} />
            </label>
          </div>
          <Input
            id="email"
            name="email"
            onChange={this.handleChange}
            required={true}
            type="email"
            value={this.state.email}
            placeholder={this.state.input ? "Your email has been successfully submitted!" : "Your email (we'll send max 1 email per month, no spam)"}
            disabled={this.state.input}
          />
          <Button type="submit" disabled={this.state.input}>Subscribe</Button>
        </form>
      </div>
    );
  };
};
