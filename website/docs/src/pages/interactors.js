/* eslint-disable prefer-let/prefer-let */
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

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
    title: 'Optimized for design systems',
    imageUrl: 'images/design-systems.png',
    description: (
      <>
        More and more teams opt to use design systems to build their apps, which come with tricky components like date pickers or interactive tables. Eliminate hacky and fragile tests from those cases by shipping Interactors along with your design system components.
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

function Interactors() {
  const context = useDocusaurusContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { siteConfig = {} } = context;
  return (
    <Layout
      title="Interactors"
      description="Test your app as a person uses it">
      <header>
        <div className={clsx("container", styles.heroContainer)}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>
              Test your app as real people use it
            </h1>
            <p className={styles.heroSubheader}>
              Interactors make it easy to test UIs at scale while keeping accesibility at the core.
            </p>
            <Link
              className={styles.ctaButton}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
          <div className={styles.heroImage}>
            <img src="/images/interactors-hero.png" alt="" />
          </div>
        </div>
      </header>
      <main>
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
            to={useBaseUrl('docs/')}>
            Try Interactors
            </Link>
        </section>

        <section>
          <div className={styles.textColumn}>
            <img src={useBaseUrl('images/decor-dots-horizontal.png')} alt="" className={styles.topDecoration} />
            <h2>Why use Interactors?</h2>
            <p>
              In many typical test suites, if you change something about
              one button, you may have to change dozens of tests.
              It can take more time to update the tests than to make the
              change in the codebase.
              Does that sound familiar?
                  </p>
            <p>
              Interactors were designed to help solve this problem
              and bring your user interface tests closer to what users
              actually do.
                  </p>
            <p>
              A user finds something they want to interact with,
              takes action, and gets a result.
              The code to accomplish these same steps in a test is in one
              place as an Interactor.
              These Interactors can then be reused in many different test
              contexts.
              You can even create your own Interactors that test for
              whether a UI is accessible to people using assistive
              technology or navigating by keyboard controls.
                  </p>
            <p>
              Best of all, you do not need to throw out your existing
              tests when you try out Interactors! They fit right in
              with the work that you have already done.
              Try out the Quick Start guide to see this in action
              in your own app's test suite.
                  </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Interactors;

