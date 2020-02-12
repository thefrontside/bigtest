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

const WhyBigTest: React.FC = () => (
  <Section>
    <H2 color="secondary">Why BigTest?</H2>
    <List>
      <Item largeOrder="0">
        <H4>Seriously fast</H4>
        <p>Designed and implemented to speed up test writing, execution, and maintenance.</p>
      </Item>
      <Item largeOrder="3">
        <H4>Experienced-centered</H4>
        <p>Test what matters to users through a refined developer experience.</p>
      </Item>
      <Item largeOrder="1">
        <H4>Revolutionary architecture</H4>
        <p>Built from the ground up with new technologies for modern apps.</p>
      </Item>
      <Item largeOrder="4">
        <H4>Cross-Browser/Device</H4>
        <p>If your user can see it, you can test it. Mix and match any browser and device or OS.</p>
      </Item>
      <Item largeOrder="2">
        <H4>Cross-Framework</H4>
        <p>Test no matter what you build your UI with: React, Vue, Ember, Angular, bring it on!</p>
      </Item>
      <Item largeOrder="5">
        <H4>Extensible</H4>
        <p>We provide powerful APIs to bring testing to the new decade.</p>
      </Item>
    </List>
  </Section>
);

export default WhyBigTest;
