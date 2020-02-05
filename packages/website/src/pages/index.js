import React from 'react';
import styled from 'styled-components';

import Section from '../components/Section';
import Flex from '../components/Flex';
import Box from '../components/Box';
import Hero from '../components/Hero';
import { H1, H2, H3, H4 } from '../components/heading';
import Image from '../components/Image';
import Layout from '../components/layout';
import Text, { Strong } from '../components/Text';
import Subscribe from '../components/subscribe';
import WhyBigTest from '../components/WhyBigTest';

import discord_icon from '../images/icons/discord.svg';
import placeholder from '../images/frontside/bigtest-icon.svg';
import tests_intro from '../images/landing/tests-intro.svg';
import reusable from '../images/landing/reusable.svg';
import user_experience from '../images/landing/user-experience.svg';

const SideBox = styled.div`
  background-color: var(--color-light-light-blue);
  padding: var(--space-double);
`;

const ContactItem = styled.a`
  display: flex;
  color: var(--color-dark-blue);
  align-items: center;
`;

const ContactIcon = styled.img`
  height: calc(var(--size-base)*2/1.75);
  padding-right: var(--space-half);
`;

const IndexPage = () => (
  <Layout>
    <Hero>
      <Flex alignItems='center' flexWrap='wrap'>
        <Box width={[1, 1/2, 2/3]} paddingRight={[0, 'large', 'xLarge']}>
          <H1>
            <Strong>Tests that speed up development,</Strong><br />
            not the other way around
          </H1>
          <Text>
            BigTest is a toolkit that enables you to test real-world experiences on your app rapidly, in every browser and device, regardless of your JS framework of choice.
          </Text>
          <Subscribe text="Get notified about BigTest progress and know when it's ready:" bold={true} />
        </Box>
        <Image
          width={[1, 1/2, 1/3]}
          paddingX={['xLarge', 'small', 'large']}
          marginTop={['large', 0, 0]}
          src={tests_intro}
          alt='BigTest: automated, fast, reliable, and cross-browser tests.'
        />
      </Flex>
    </Hero>
    <WhyBigTest />
    <Section>
      <Flex flexWrap='wrap'>
        <Box width={[1, 1/2, 2/3]} paddingRight={[0, 'medium', 'xLarge']}>
          <H2 color='contrast'>
            Are you testing code or actual user experiences?
          </H2>
          <Text>
            When building an application for the web, it's not enough to know if the code works at the component level. Instead, it's vital to test from the perspective of a real person who will be using it. Does your app work in a real browser? What about multiple browsers and devices? Where are the wrinkles that need to be ironed out?
          </Text>
          <Text>
            BigTest validates your code from the perspective of your user--what they see and interact with. This makes it possible to not only test individual functionality, but also get visibility on how different components interact and how a release will affect other parts of the code base.
          </Text>
        </Box>
        <Image
          width={[1, 1/2, 1/3]}
          paddingX={['xLarge', 'large', 'xLarge']}
          marginTop={['large', 0, 0]}
          src={user_experience}
          alt='BigTest checks experiences as your user would'
        />
      </Flex>
    </Section>
    <Section>
      <Flex>
        <Box width={[1, 1/2, 2/3]} paddingRight={[0, 'medium', 'xLarge']}>
          <H2>
            Seriously fast testing
          </H2>
          <Text>
            When you're trying to test from the perspective of your user, there's a lot of information coming in. All the clicks, streaming updates from the server, and the hundreds (or thousands) of background processes create a highly asynchronous environment. As a result, UI testing has historically been time-intensive in both setup and run time.
          </Text>
          <Text>
            BigTest cuts through the noise with a process we call <i>convergences</i>. Convergences are immutable, reusable, and composable assertions that allow you to know immediately when the desired state is achieved. In other words, BigTest checks the DOM every 10ms to verify that an assertion is true, so tests pass at the soonest possible point. This adds up to a test suite that outperforms all alternatives.
          </Text>
        </Box>
        <Box width={[1, 1/2, 1/3]}>
          <SideBox>
            <H3>
              Flexible &amp; framework agnostic
            </H3>
            <Text>
              BigTest is a toolkit of several packages that can be used separately or together. The result is open source software that's flexible to fit your application, regardless of framework (React, Vue, Ember, Angular, etc.), test framework (Mocha, Jasmine, etc.), browser, or device.
            </Text>
          </SideBox>
        </Box>
      </Flex>
    </Section>
    <Section>
      <Flex>
        <Box width={[1, 1/2, 2/3]} paddingRight='large'>
          <H2 color="secondary">
            BigTest makes your tests reusable
          </H2>
          <Text>
            Traditional testing has a tendency to become unwieldy. And when it comes to SPAs, most testing tools aren't designed to easily test asynchrony and DOM based interactions. As a result, your team spends more time dealing with asynchrony and figuring out DOM selectors than actually writing tests.
          </Text>
          <Text>
            BigTest solves this with what we call <i>Interactors</i>, which act as a composable abstractions that are easy to reuse, even in large component-based applications. This allows your team to focus on writing tests, rather than looking for DOM selectors or making updates every time a selector changes.
          </Text>
        </Box>
        <Image
          width={[1, 1/2, 1/3]}
          paddingX={['xLarge', 'large', 'xLarge']}
          marginTop={['large', 0, 0]}
          src={reusable}
          alt='Reuse code across tests with BigTest'
        />
      </Flex>
    </Section>
    <Hero>
      <Flex align="initial">
        <div flex={2}>
          <H2 color="dark-blue">
            Want to know more about BigTest?
          </H2>
          <Subscribe text="Join our mailing list! Receive updates and be an expert by the time BigTest is officially released." />
        </div>
        <div flex={1}>
          <H4>Reach out!</H4>
          <ul>
            <li>
              <ContactItem href="https://twitter.com/thefrontside">
                <ContactIcon src={placeholder} alt="placeholder" />  @thefrontside #bigTest
              </ContactItem>
            </li>
            <li>
              <ContactItem href="mailto:bigtest@frontside.io">
                <ContactIcon src={placeholder} alt="placeholder" />
                bigtest@frontside.io
              </ContactItem>
            </li>
            <li>
              <ContactItem href="https://discord.com">
                <ContactIcon src={discord_icon} alt="discord" />
                Join our Discord!
              </ContactItem>
            </li>
          </ul>
        </div>
      </Flex>
    </Hero>
  </Layout>
);

export default IndexPage;
