import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

import Image from './Image';
import Box from './Box';

import { frontside_logo } from '../images';

const FooterBox = styled(Box)`
  background-color: ${({ theme }) => theme.colors.footer};
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: ${({ theme }) => theme.space.xxLarge};
  margin-top: ${({ theme }) => theme.space.large};
`;

const FooterLink = styled(Link)`
  height: ${({ theme }) => theme.space.large};
`;

const FooterLogo = styled(Image)`
  padding-left: ${({ theme }) => theme.space.small};
  height: 100%;
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const Footer = () => (
  <FooterBox>
    <FooterText>Brought to you by</FooterText>
    <FooterLink to="/">
      <FooterLogo src={frontside_logo} alt="BigTestJS" />
    </FooterLink>
  </FooterBox>
);

export default Footer;
