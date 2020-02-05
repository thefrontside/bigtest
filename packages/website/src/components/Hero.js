import React from 'react';
import styled from 'styled-components';
import Section from './Section';

const HeroLine = styled.section`
  border-left: 9px solid ${({ theme }) => theme.colors.brand.darkBlue};
  padding: ${({ theme }) => theme.space.medium} 0;
`;

const Hero = ({ children }) => (
  (
    <HeroLine>
      <Section as='div'>
        {children}
      </Section>
    </HeroLine>
  )
);

export default Hero;
