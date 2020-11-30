// import React from 'react';
// import clsx from 'clsx';
// import Layout from '@theme/Layout';
// import Link from '@docusaurus/Link';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import useBaseUrl from '@docusaurus/useBaseUrl';
// import styles from './styles.module.css';

// /* 

// // originally from interactors/getting-started/why-bigtest

// Who should use BigTest? (need a better name for this) - someone should be able to link to this page, and it is their persuasive argument for why the team should adopt these tools. These are not sections but more like points that should be covered in some way:

// 1-2 sentences that explain the “why”

// What can you test with Interactors/BigTest?

// What problems does this solve/benefits? (Easier to write tests, refactor UIs, shared testing helpers for component libraries, can test for a11y, etc)

// How this fits into an existing testing strategy 



import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Cross-platform',
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Interactors are compatible with your existing tests in Jest, Cypress,
        BigTest, and more. You can add them in over time to improve what you
        already have.
      </>
    ),
  },
  {
    title: 'Maintainable',
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Interactors help keep your test suite flexible.
        When you change some text or layout in your app,
        you make only one change to your tests.
      </>
    ),
  },
  {
    title: 'Versatile',
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Almost very app has an interface that is tricky to test, like
        date pickers or interactive tables.
        Interactors have got you covered.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Interactors() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title="Interactors"
      description="Write better user interface tests with less code.">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">
            Interactors
          </h1>
          <p className="hero__subtitle">
            Write better user interface tests with less code.
          </p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/interactors')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Interactors;

