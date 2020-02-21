import React from 'react';
import styled from 'styled-components';

import Text from './Text';
import { H3 } from './Heading';

const SideBox = styled.div`
  background-color: ${({ theme }) => theme.colors.didyouknow};
  padding: ${({ theme }) => theme.space.large};

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    padding: ${({ theme }) => theme.space.xLarge};
  }
`;

const DidYouKnow: React.FC = () => {
  return (
    <SideBox>
      <H3>Flexible &amp; framework agnostic</H3>
      <Text>
        BigTest is a powerful framework planned and architectured to be extensible. We provide APIs that allow
        teams to build on top of BigTest and integrate tests more deeply into their development processes.
      </Text>
    </SideBox>
  );
};

export default DidYouKnow;
