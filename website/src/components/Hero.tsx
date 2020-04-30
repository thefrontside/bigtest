import React from 'react';
import styled from 'styled-components';
import Section from './Section';

const HeroLine = styled.section`
  border-left: 9px solid ${({ theme }) => theme.colors.brand.darkBlue};
  padding: ${({ theme }) => theme.space.medium} 0;
`;

export const HeroLink = styled.a`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.secondary};
`;

const Hero: React.FC = ({ children }) => (
  <HeroLine>
    <Section as="div">{children}</Section>
  </HeroLine>
);

export default Hero;
