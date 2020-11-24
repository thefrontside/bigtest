import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/* 

// originally from interactors/getting-started/why-bigtest

Who should use BigTest? (need a better name for this) - someone should be able to link to this page, and it is their persuasive argument for why the team should adopt these tools. These are not sections but more like points that should be covered in some way:

1-2 sentences that explain the “why”

What can you test with Interactors/BigTest?

What problems does this solve/benefits? (Easier to write tests, refactor UIs, shared testing helpers for component libraries, can test for a11y, etc)

How this fits into an existing testing strategy 

*/

function Interactors() {
  let context = useDocusaurusContext();
  let {siteConfig = {}} = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">
            Interactors
          </h1>
          <p className="hero__subtitle">
            Cool stuff!
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
    </Layout>
  );
}

export default Interactors;
