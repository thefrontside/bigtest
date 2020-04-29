import React from 'react';
import styled from 'styled-components';
import Section from './Section';
import { H2, H4 } from './Heading';

interface ItemProp {
  largeOrder: string;
}

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`;

const Item = styled.li<ItemProp>`
  display: block;
  box-sizing: border-box;
  padding-bottom: ${({ theme }) => theme.space.large};
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    width: 50%;
    padding-right: ${({ theme }) => theme.space.large};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    width: ${(1 / 3) * 100}%;
    padding-right: ${({ theme }) => theme.space.xLarge};
    order: ${({ largeOrder }) => largeOrder};
  }
`;

const WhyBigTest: React.FC<{ title?: string }> = ({ title }) => (
  <Section>
    <H2 color="secondary">{title ? title : 'Why BigTest?'}</H2>
    <List>
      <Item largeOrder="0">
        <H4>Helpful test results</H4>
        <p>Designed to diagnose the cause of test failure at a glance.</p>
      </Item>
      <Item largeOrder="3">
        <H4>Revolutionary Architecture </H4>
        <p>Built from the ground up with new technologies for modern apps.</p>
      </Item>
      <Item largeOrder="1">
        <H4>Easy To Use</H4>
        <p>Flexibly built to facilitate test writing, running, and maintenance.</p>
      </Item>
      <Item largeOrder="4">
        <H4>Cross-browser, cross-device</H4>
        <p>Tests your apps in user-relevant contexts and scenarios.</p>
      </Item>
      <Item largeOrder="2">
        <H4>Framework agnostic</H4>
        <p>Works with everyone's preferred JavaScript framework.</p>
      </Item>
      <Item largeOrder="5">
        <H4>Dynamically Extensible</H4>
        <p>Conceived to create a community-based robust testing ecosystem.</p>
      </Item>
    </List>
  </Section>
);

export default WhyBigTest;
