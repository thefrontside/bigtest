import React from 'react';
import styled from 'styled-components';
import Section from '../components/Section';
import { H2, H4 } from '../components/heading';

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`;

const Item = styled.li`
  display: block;
  box-sizing: border-box;
  padding-bottom: ${({ theme }) => theme.space.large};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {   
    width: 50%;
    padding-right: ${({ theme }) => theme.space.large};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {   
    width: ${(1/3)*100}%;
    padding-right: ${({ theme }) => theme.space.xLarge};
    order: ${({ largeOrder }) => largeOrder};
  }
`;

const WhyBigTest = () => (
  <Section>
    <H2 color='secondary'>Why BigTest?</H2>
    <List>
      <Item largeOrder='0'>
        <H4>
          Seriously fast
        </H4>
        <p>
          Designed and implemented for speed.
        </p>
      </Item>
      <Item largeOrder='3'>
        <H4>
          Experienced-centered
        </H4>
        <p>
          Test what matters to users through a refined developer experience.
        </p>
      </Item>
      <Item largeOrder='1'>
        <H4>
          Cross-Browser
        </H4>
        <p>
          Chrome, Safari, Firefox, Opera, etc.
        </p>
      </Item>
      <Item largeOrder='4'>
        <H4>
          Cross-Device
        </H4>
        <p>
          Windows, macOS, iOS, Android, etc.
        </p>
      </Item>
      <Item largeOrder='2'>
        <H4>
          Cross-Framework
        </H4>
        <p>
          React, Vue, Ember, Angular, etc.
        </p>
      </Item>
      <Item largeOrder='5'>
        <H4>
          Cross-Test Framework
        </H4>
        <p>
          Mocha, Jasmine, Jest, etc.
        </p>
      </Item>
    </List>
  </Section>
);

export default WhyBigTest;