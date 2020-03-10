import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

import Section from './Section';
import IconLink, { FauxImageLink } from './IconLink';

import { bigtestLogoSVG, discordIconSVG, githubIconSVG } from '../images';

const HeadWrapper = styled(Section)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.space.xLarge};
  padding-bottom: ${({ theme }) => theme.space.xLarge};
`;

const LogoLink = styled(Link)`
  ${FauxImageLink}
  background-image: url(${bigtestLogoSVG});
  height: ${({ theme }) => theme.fontSizes.xxxLarge};
  width: 300px;
`;

const Nav = styled.nav`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

// const APILink = styled(Link)`
//   color: ${({ theme }) => theme.colors.primary};
//   font-weight: ${({ theme }) => theme.fontWeights.bold};
//   font-size: ${({ theme }) => theme.fontSizes.medium};
//   font-family: ${({ theme }) => theme.fonts.heading};
//   letter-spacing: 1px;
//   align-content: center;
//   margin: 0 ${({ theme }) => theme.space.medium};
// `;

const LegacyLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-family: ${({ theme }) => theme.fonts.heading};
  align-content: center;
  margin-left: ${({ theme }) => theme.space.medium};
  padding-left: ${({ theme }) => theme.space.medium};
  border-left: 1px solid ${({ theme }) => theme.colors.primary};
`;

const Header = () => (
  <HeadWrapper as="header">
    <LogoLink to="/">BigTest</LogoLink>
    <Nav>
      {/* <APILink to='' title='API Documentation'>API</APILink> */}
      <IconLink
        icon={githubIconSVG}
        href="https://github.com/thefrontside/bigtest.git"
        title="Project Github"
        target="_blank"
      >
        Github
      </IconLink>
      <IconLink icon={discordIconSVG} href="https://discord.gg/W7r24Aa" title="Discord community" target="_blank">
        Discord
      </IconLink>
      <LegacyLink href="http://v1.bigtestjs.io/">
        v1.x Docs &#8594;
      </LegacyLink>
    </Nav>
  </HeadWrapper>
);

export default Header;
