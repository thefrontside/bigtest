import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import SubscribeForm from "../components/subscribe-form";

import {
  featureImage,
  featureRow,
  featureText,
  featureTextAlternate,
  featureImageSmaller,
  heroText,
  heroWrap,
  heroCode,
  homeBottomCTA,
  pageWrap
} from "../css/page.css";
import {
  bigQuote,
  bigQuoteAuthor,
  featureHeading,
  heading3Xl,
  textLg,
  mardownColumn,
  textGradientPurpleViolet
} from "../css/typography.css";
import { actionButton } from "../css/buttons.css";
import { heroDemo, iframeDemo, centeredHeroText } from "../css/bigtest.css";

const features = [
  {
    title: "Test across browsers effortlessly",
    imageUrl: "images/testing-cross-platform.png",
    description: (
      <>
        We love Cypress, but its design is limited to only ensuring your app
        works in desktop Blink (Chrome, Edge) and Gecko (Firefox, Brave)
        browsers; and while Selenium allows testing cross browsers, it can
        rapidly become slow and unreliable. Thanks to Bigtest&#x27;s brand new
        distributed agent architecture, it brings you the ease of use of Cypress
        combined with the power of Selenium.
      </>
    ),
    alternate: false
  },
  {
    title: "Easier testing starts with helpful error messages",
    imageUrl: "images/error-sample.svg",
    description: (
      <>
        Developers spend more than 30% of their time debugging errors, and
        failed tests are no exception. Bigtest&#x27;s brand new architecture
        provides you with insightful error messages, sparing you the
        never-ending logs.
      </>
    ),
    alternate: true
  },
  {
    title: "A unified testing platform",
    imageUrl: "images/unified-platform.png",
    description: (
      <>
        Today’s web UI testing harnesses are a cobbled together jumble of
        independent test runners (i.e. karma, mocha), assertion libraries (i.e.
        chai, assertjs, expect) and runtime environment (i.e. nightmare,
        puppeteer, electron) that cannot be easily coordinated into a uniform
        testing experience. Bigtest was designed from the ground up as a single,
        comprehensive testing platform, where every piece is optimized for the
        rest.
      </>
    ),
    alternate: false
  }
];

function Feature({ imageUrl, title, description, alternate }) {
  let imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={featureRow}>
      <div className={alternate ? featureTextAlternate : featureText}>
        <h2 className={featureHeading}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={featureImage}>
        <img src={imgUrl} className={featureImageSmaller} alt="" />
      </div>
    </div>
  );
}

function Interactors() {
  return (
    <Layout description="Truly cross browser testing">
      <header>
        <div className={heroWrap}>
          <div className={centeredHeroText}>
            <h1 className={heading3Xl}>
              <span className={textGradientPurpleViolet}>Bigtest:</span>
              <br />
              universal testing platform using GraphQL
            </h1>
            <p className={textLg}>
              Ensure your app works perfectly across browsers without traces of Selenium, Playwright or earlier tools.
            </p>
            <Link className={actionButton} to={useBaseUrl("docs")}>
            Start exploring
            </Link>
          </div>
          <div className={heroDemo}>
            <iframe
              src={useBaseUrl("/asciinema/iframes/cross-platform.html")}
              className={iframeDemo}
              scrolling="no"
            />
          </div>
        </div>
      </header>
      <section className={pageWrap}>
        <div>
          <blockquote className={bigQuote}>
            “
            <strong>
              Bigtest is the testing framework I've always wanted to have. It
              takes all we've learned about testing and wraps it up in a
              coherent and powerful package.
            </strong>
            ”
          </blockquote>
          <p className={bigQuoteAuthor}>
            — Jonas Nicklas, Creator of{" "}
            <a
              href="https://github.com/teamcapybara/capybara"
              target="_blank"
              rel="nofollow"
              className="link"
            >
              Capybara
            </a>
            , co-creator of Bigtest
          </p>
        </div>

        {features && features.length > 0 && (
          <>
            {features.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </>
        )}

        <p className={homeBottomCTA}>
          <Link className={actionButton} to={useBaseUrl("docs")}>
            Explore Bigtest
          </Link>
        </p>

        {/* <SubscribeForm highlight={true} /> */}
        <section className={mardownColumn}>
          <h2>Why try Bigtest?</h2>

          <p>
            We partnered with the creators of existing testing solutions to
            envision how a modern testing platform would look like. After
            several years of development and many iterations and re-writes, we
            created at the current Bigtest architecture that enables us to run
            reliable tests fast.
          </p>

          <h3>Philosophy: test more with less effort</h3>

          <p>
            Bigtest wants to enable you to develop <em>big tests</em> easily and
            affordably. What do we mean by “big tests”? The term is a reference
            to{" "}
            <a
              href="https://testing.googleblog.com/2010/12/test-sizes.html"
              target="_blank"
              className="link"
            >
              Google&#x27;s test size categorization
            </a>
            : a unit test is a small test because it doesn&#x27;t exercise a lot
            of the app&#x27;s code, while an end-to-end test is big because it
            touches on most of the app&#x27;s stack. But tests that are big are
            expensive to create and difficult to ensure reliability. Bigtest
            enables you to efficiently write big tests you can count on with
            comprehensive and extensible APIs.
          </p>
          <p>
            In today&#x27;s testing ecosystem, there&#x27;s plenty of tools for
            smaller tests. But the amount of tools available keeps shrinking
            when you go up in the test size scale, leaving Selenium reigning at
            the top for web UI <em>big</em> testing. Bigtest retains the power
            of Selenium but re-imagining the architecture of a test suite,
            unlocking new possibilities for developer experience with a
            data-driven approach over GraphQL.
          </p>
        </section>
      </section>
    </Layout>
  );
}

export default Interactors;
