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
      <H3>Framework agnostic</H3>
      <Text>
        BigTest is ready to test your modern web application, no matter if you use React, Vue, Angular, Ember, or
        anything else.
      </Text>
      <Text>
        BigTest uses your build process to serve the application that will be tested, with the environment
        variables that you desire. This setup also enables you to test your application under different conditions.
      </Text>
    </SideBox>
  );
};

export default DidYouKnow;
