import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

import logo from '../images/frontside/frontside-logo.svg';

const logo_height = 'var(--space-double)';

const FooterContainer = styled.footer`
  background-color: var(--footer-bg);
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  height: var(--space-single-vw);
  margin-top: var(--space-triple);
`;

const FooterLink = styled(Link)`
  height: ${logo_height};
`;

const FooterLogo = styled.img`
  padding-left: var(--space-half);
  height: 100%;
`;

const FooterText = styled.div`
  color: var(--color-dark-blue);
`;

const Footer = () => (
  <FooterContainer>
    <FooterText>
      Brought to you by
    </FooterText>
    <FooterLink to="/" >
      <FooterLogo src={logo} alt="BigTestJS" />
    </FooterLink>
  </FooterContainer>
);

export default Footer;
