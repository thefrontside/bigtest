import React from 'react';

import Section from '../components/Section';
import Flex from '../components/Flex';
import Box from '../components/Box';
import Hero from '../components/Hero';
import { H1, H2, H3 } from '../components/Heading';
import Image from '../components/Image';
import Layout from '../components/Layout';
import Text, { Strong } from '../components/Text';

import GreetLegacyUsers from '../components/GreetLegacyUsers';
import DidYouKnow from '../components/DidYouKnow';
import ReachOut from '../components/ReachOut';
import SubscribeForm from '../components/SubscribeForm';
import WhyBigTest from '../components/WhyBigTest';

import { reusableSVG, testsIntroSVG, userExperienceSVG } from '../images';

const IndexPage = () => (
  <Layout>
    <Hero>
      <Flex alignItems="center" flexWrap="wrap">
        <Box width={[1, 1 / 2, 2 / 3]} paddingRight={[0, 'large', 'xxxLarge']}>
          <H1>
            <Strong>Tests that speed up development,</Strong>
            <br />
            not slow it down
          </H1>
          <Text fontSize="large">
            BigTest lets developers test their applications across browsers and devices and provides them with
            swift and actionable feedback.
          </Text>
          <Box marginTop={['small', 'small', 'small', 'xxLarge']}>
            <H3>Get notified about BigTest progress and know when it's ready:</H3>
            <SubscribeForm id={1} />
          </Box>
        </Box>
        <Image
          width={[1, 1 / 2, 1 / 3]}
          paddingX={['xLarge', 'small', 'large']}
          marginTop={['large', 0, 0]}
          src={testsIntroSVG}
          alt="BigTest: automated, fast, reliable, and cross-browser tests."
        />
      </Flex>
    </Hero>
    <GreetLegacyUsers />
    <WhyBigTest />
    <Section>
      <Flex flexWrap="wrap">
        <Box width={[1, 1 / 2, 2 / 3]} paddingRight={[0, 'medium', 'xxxLarge']}>
          <H2 color="contrast">Test experiences, not just code</H2>
          <Text>
            Web applications generate value when they deliver meaningful experiences to their users, but people use
            them under different conditions and contexts. While one person might be trying to find the perfect gift
            for their loved one on their phone using Firefox Focus for privacy, someone else is using Safari on
            their tablet trying to change a reservation in a café with a poor connection. Tests are an important
            safeguard to ensure that everyone has the same great experience and gets what they need using your
            app. 
          </Text>
          <Text>
            Testing tools have traditionally generated a simulated context to assert the application and put it
            through its paces. Jest runs tests in a JSDOM context while Cypress generates a Chrome environment
            through Electron. Both offer constructive feedback on how to act on the test results, but both are
            limited by their respective test context constraints. While these tools are useful, there’s still a
            large number of scenarios that elude what they can safeguard against.
          </Text>
          <Text>
            BigTest is different. It lets you test your application across browsers and devices, validating your
            code from the perspective of your user. In order to enable this, BigTest allows your tests to be
            automatically run through a URL, just as your user would use your app. Additionally, BigTest provides
            out of the box solutions to execute this context in a CI server.
          </Text>
        </Box>
        <Image
          width={[1, 1 / 2, 1 / 3]}
          paddingX={['xLarge', 'large', 'xLarge']}
          marginTop={['large', 0, 0]}
          src={userExperienceSVG}
          alt="BigTest checks experiences as your user would"
        />
      </Flex>
    </Section>
    <Section>
      <Flex flexWrap="wrap">
        <Box width={[1, 1 / 2, 2 / 3]} paddingRight={[0, 'medium', 'xxLarge']}>
          <H2>Tests that are quick to write, run, and maintain</H2>
          <Text>
            Tests are tools to help us see what we don’t know; they alert us to what is broken when we thought
            something was unaffected. The best tests swiftly and precisely diagnose the issue so teams can iterate
            and problem-solve on the spot.
          </Text>
          <Text>
            BigTest facilitates the creation and maintenance of tests by employing Interactors. Instead of relying
            on class-names or HTML-attributes which continuously change, Interactors are easy to use stable
            interfaces that developers can use (and reuse) throughout their tests.
          </Text>
          <Text>
            And BigTest introduces a smarter way to execute your tests. By design, BigTest has more information and
            context about your tests than existing alternatives. Thus it can predict that an entire subset of tests
            will fail based on early results, saving you time that would have been lost waiting for tests that
            previously could only be run sequentially.
          </Text>
        </Box>
        <Box width={[1, 1 / 2, 1 / 3]}>
          <DidYouKnow />
        </Box>
      </Flex>
    </Section>
    <Section>
      <Flex flexWrap="wrap">
        <Box width={[1, 1 / 2, 2 / 3]} paddingRight={[0, 'medium', 'xxLarge']}>
          <H2 color="secondary">Innovative architecture</H2>
          <Text>
            BigTest’s architecture represents a departure from traditional test runners. Instead of being a
            stateless tool, BigTest relies on data storage and sharing to allow users to interact with the test in
            real-time. This approach enables advanced test analytics of the kind that were previously only
            available to big players like Facebook and Google. 
          </Text>
          <Text>
            Using GraphQL as an interface, BigTest provides unprecedented visibility into the minutiae of each test
            run as it happens. This capability enables more creative visualizations and completely new interfaces
            that have yet to be imagined.
          </Text>
          <Text>
            BigTest also provides meaningful APIs so you can build on top of the framework. It permits deeper
            integrations of tests into the development process that allows developers to consume test results and
            validate their code without requiring them to leave the editor. 
          </Text>
        </Box>
        <Image
          width={[1, 1 / 2, 1 / 3]}
          paddingX={['xLarge', 'large', 'xLarge']}
          marginTop={['large', 0, 0]}
          src={reusableSVG}
          alt="Reuse code across tests with BigTest"
        />
      </Flex>
    </Section>
    <Hero>
      <Flex flexWrap="wrap" alignItems="center">
        <Box width={[1, 1, 2 / 3]} paddingRight={[0, 'medium', 'xxLarge']}>
          <H2 color="dark-blue">Want to know more about BigTest?</H2>
          <Text>
            Join our mailing list! Receive updates and be an expert by the time BigTest is officially released.
          </Text>
          <SubscribeForm id={2} />
        </Box>
        <Box width={[1, 1, 1 / 3]} marginTop={['large', 'large', 0]}>
          <ReachOut />
        </Box>
      </Flex>
    </Hero>
  </Layout>
);

export default IndexPage;
