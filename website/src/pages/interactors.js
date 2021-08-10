/* eslint-disable prefer-let/prefer-let */
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import SubscribeForm from '../components/subscribe-form';

// // originally from interactors/getting-started/why-bigtest

// Who should use BigTest? (need a better name for this) - someone should be able to link to this page, and it is their persuasive argument for why the team should adopt these tools. These are not sections but more like points that should be covered in some way:

// 1-2 sentences that explain the “why”

// What can you test with Interactors/BigTest?

// What problems does this solve/benefits? (Easier to write tests, refactor UIs, shared testing helpers for component libraries, can test for a11y, etc)

// How this fits into an existing testing strategy


// // originally from interactors/overview

// Overview
//   - this article sets the stage for how the pieces fit together

// - 1-2 sentences of what an interactor is
//   - I think Charles?: BigTest Interactors provide an API to access the components of a user interface by finding them, observing their state, and manipulating them all from the same perspective as a user.
// - Code example
// - Summary of what someone will learn
// - Brief explanation of Actions, Locators, Filters. We do this here because reading an in-depth article about each, introduced one at a time, can be disorienting
// - Why use interactors?

// ***
// i brought this over from asynchronus page as i think it makes more sense to describe the principles here:
//   - 1-2 sentences that say the most important thing - you don’t need to worry about async interactions
//   - Example of a common async UI pattern
//   - How Interactors help you solve it
//   - How is this possible? Introduce the term convergence
// ***


const features = [
  {
    title: 'Compatible with your test suite',
    imageUrl: 'images/cross-platform.png',
    description: (
      <>
        Interactors work out-of-the-box with your existing tests in Jest, Cypress, BigTest, and more. You can add them in over time to improve what you already have.
      </>
    ),
  },
  {
    title: 'UX & a11y centric',
    imageUrl: 'images/ux-centric.png',
    description: (
      <>
        Nobody uses an app by searching <code>[test-data-submit-button]</code> selectors: we read labels, click buttons, or navigate through keystrokes. Interactors help you detect interaction flaws such as ambiguity in the elements of your page or the lack of adequate aria labels.
      </>
    ),
  },
];

const resources = [
  {
    title: 'BigTest Interactors: the design systems testing ally',
    description: 'In this article, Charles and Jeffrey walks us through three testing advantages that Interactors bring to teams using Design Systems: composability, abstraction, and type-safety.',
    link: 'https://frontside.com/blog/2021-08-04-interactors-design-systems/'
  },
  {
    title: 'The Lesson of BigTest Interactors: never write a flaky test again!',
    description: 'To prevent flaky tests, BigTest introduces the Interactor API, designed around the lessons learned in Capybara. In this article, Jonas explains how the event-loop is used by Interactors to reduce flakiness.',
    link: 'https://frontside.com/blog/2020-07-16-the-lesson-of-bigtest-interactors/'
  }
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <section className={styles.feature}>
      {imgUrl && (
        <div className={styles.featureImage}>
          <img src={imgUrl} alt='' />
        </div>
      )}
      <div className={styles.featureText}>
        <h2 className={styles.featureHeading}>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}

function Resource({ title, description, link }) {
  return (
    <div className={styles.resourceEntry}>
      <h3>
        <a href={link} target="_blank" rel="noopener">
          {title}
        </a>
      </h3>
      <p>
        {description}
      </p>
      <a href={link} target="_blank" rel="noopener">
        <strong>Continue reading</strong>
      </a>
    </div>
  );
}

function Interactors() {
  const context = useDocusaurusContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { siteConfig = {} } = context;
  return (
    <Layout
      title="Interactors"
      description="Test your app as real people use it">
      <nav className={styles.pageNav}>
        <span>Jump to:</span>
        <Link
          className={styles.pageNavLink}
          to={useBaseUrl('docs/interactors')}>
          Documentation
        </Link>
        <Link
          className={styles.pageNavLink}
          to={useBaseUrl('docs/interactors/write-your-own')}>
          Writing Interactors
        </Link>
        <Link
          className={styles.pageNavLink}
          to={useBaseUrl('docs/interactors/integrations')}>
          Cypress &amp; Jest
        </Link>
        <Link
          className={styles.pageNavLink}
          to={useBaseUrl('docs/interactors/storybook')}>
          Storybook
        </Link>
      </nav>
      <header>
        <div className={clsx('container', styles.heroContainer, styles.marginBottomLarge)}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>
             BigTest Interactors
            </h1>
            <p className={styles.heroSubheader}>
             Composable page objects for testing apps written with component libraries
            </p>
            <Link
              className={styles.ctaButton}
              to={useBaseUrl('docs/interactors')}>
              Try them out!
            </Link>
          </div>
          <div className={clsx(styles.heroImage, styles.interactorsHero, 'interactors-hero-tabs')}>
            <div className={styles.interactorsHeroBackground}>
              <Tabs
                defaultValue="jest"
                values={[
                  {label: 'Jest', value: 'jest'},
                  {label: 'Cypress', value: 'cypress'},
                  {label: 'BigTest (alpha)', value: 'bigtest'}
                ]}>
                <TabItem value="jest">
                  <CodeBlock className='language-js'>
                    {`it('subscribes to newsletter', async () => {
  await Input('email').fillIn('jorge@frontside.com');
  await Button('Subscribe').click();

  await Heading('Thanks!').exists();
})`}
                  </CodeBlock>
                </TabItem>
                <TabItem value="cypress">
                  <CodeBlock className="language-js">
                    {`it('subscribes to newsletter', () => {
  cy.do([
    Input('email').fillIn('jorge@frontside.com'),
    Button('Subscribe').click()
  ]);
  cy.expect([
    Heading('Thanks!').exists();
  ])
})`}
                  </CodeBlock>
                </TabItem>
                <TabItem value="bigtest">
                  <CodeBlock className="language-js">
                    {`test('subscribes to newsletter')
  .step([
    Input('email').fillIn('jorge@frontside.com'),
    Button('Subscribe').click()
  ])
  .assertion(
    Heading('Thanks!').exists()
  );`}
                  </CodeBlock>
                </TabItem>
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.featureDesignSystems}>
          <div className={styles.feature}>
            <div className={styles.featureImage}>
              <img src={useBaseUrl('images/design-systems.png')} alt='' />
            </div>
            <div className={styles.featureText}>
              <h2 className={styles.featureHeading}>
              Testing a UI should be as easy as building it
              </h2>
              <p>
              Interactors allow design systems maintainers to ship reusable and simplified testing practices alongside their components. Thus, their users can start testing right away without figuring out internal markup or selectors.
              </p>
            </div>
          </div>
          <div className={clsx(styles.bigQuoteWrapper, styles.wideBigQuote)}>
            <blockquote className={styles.bigQuote}>
              “No more worries over the tests of your dependent projects!<br />
              <span className={styles.bigQuoteIndent}></span>It feels great to provide your library's consumers with such a great tool for their tests that will stay right in step with your code.<br />
              <span className={styles.bigQuoteIndent}></span><strong>Gone are the days of fragile, hard-coded selectors or dependencies on mark-up structure.</strong>
              ”
            </blockquote>
            <p className={styles.bigQuoteAuthor}>— John Coburn, Component Library Lead at FOLIO</p>
          </div>
        </section>

        {features && features.length > 0 && (
          <>
            {
              features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))
            }
          </>
        )}
        <section className="text--center">
          <Link
            className={styles.ctaButton}
            to={useBaseUrl('docs/interactors')}>
            Try Interactors
            </Link>
        </section>

        <section className={styles.resourcesContainer}>
          <img src={useBaseUrl('images/decor-dots-horizontal.png')} alt="" className={styles.topDecoration} />
          <h2>Resources</h2>

          <div className={styles.resourcesList}>
            {resources && resources.length > 0 && (
              <>
                {
                  resources.map((props, idx) => (
                    <Resource key={idx} {...props} />
                  ))
                }
              </>
            )}
          </div>
        </section>
        <SubscribeForm highlight={true} />
      </main>
    </Layout>
  );
}

export default Interactors;
