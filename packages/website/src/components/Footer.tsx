import React from 'react';
import styled from 'styled-components';

import Image from './Image';

import { frontsideLogoSVG } from '../images';

const FooterBox = styled.footer`
  background-color: ${({ theme }) => theme.colors.footer};
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ theme }) => theme.space.xxLarge};
  margin-top: ${({ theme }) => theme.space.large};
`;

const FooterLink = styled.a`
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
    <FooterLink href="https://frontside.io/" target="_blank">
      <FooterLogo src={frontsideLogoSVG} alt="Frontside" />
    </FooterLink>
  </FooterBox>
);

export default Footer;
