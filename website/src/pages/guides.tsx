import React from 'react';

import Section from '../components/Section';
import Flex from '../components/Flex';
import Box from '../components/Box';
import Hero, { HeroLink } from '../components/Hero';
import { H1, H2, H4 } from '../components/Heading';
import Layout from '../components/Layout';
import Text, { Emphasis } from '../components/Text';
import WarningBox, { WarningBoxLink } from '../components/WarningBox';

import SubscribeForm from '../components/SubscribeForm';
import WhyBigTest from '../components/WhyBigTest';
import ReachOut from '../components/ReachOut';

const GuidesPage = () => (
  <Layout>
    <Hero>
      <H1>Guides</H1>
      <Text>
        <Emphasis>Enjoyable developer experiences start with great documentation.</Emphasis>
        <br />
      </Text>
      <HeroLink
        href="https://github.com/thefrontside/bigtest/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation"
        target="_blank"
      >
        Help us build BigTest's new guides &rarr;
      </HeroLink>
    </Hero>
    <Section>
      <WarningBox width={[1, 1, 2 / 3]}>
        <H4 color="bodyCopy">BigTest is going through a major renovation</H4>
        <Text>
          The core values behind BigTest remain. But the ergonomics, APIs, performance, and scope of the framework
          have changed to be more ambitious.
        </Text>
        <Text>
          We'll be working on the new Guides shortly. If you need access to v1.x Guides, they're available at:{' '}
          <WarningBoxLink href="https://v1.bigtestjs.io/guides">https://v1.bigtestjs.io/guides</WarningBoxLink>.
        </Text>
      </WarningBox>
    </Section>
    <WhyBigTest title="What's new on BigTest?" />
    <Hero>
      <Flex alignItems="center">
        <Box width={[1, 1 / 2, 2 / 3]} paddingRight={[0, 'medium', 'xxLarge']}>
          <H2 color="dark-blue">Want to know more about BigTest?</H2>
          <Text>
            Join our mailing list! Receive updates and be an expert by the time BigTest is officially released.
          </Text>
          <SubscribeForm id={2} />
        </Box>
        <Box width={[1, 1 / 2, 1 / 3]}>
          <ReachOut />
        </Box>
      </Flex>
    </Hero>
  </Layout>
);

export default GuidesPage;
