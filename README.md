<p align="center">
  <img alt="bigtest" src="logo.svg" width="500">
</p>

<p align="center">
  <a href="https://circleci.com/gh/thefrontside/bigtest/tree/master">
    <img alt="CircleCI Status" src="https://circleci.com/gh/thefrontside/bigtest/tree/master.svg?style=svg&circle-token=78c5d879b0ace4fe137c203bfc9ca20d732eb6e3" />
  </a>
  <a href="https://gitter.im/thefrontside/bigtest?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
    <img alt="Chat on Gitter" src="https://badges.gitter.im/thefrontside/bigtest.svg" />
  </a>
</p>

<p align="center">
  A Suite of JavaScript libraries and framework extensions to help you
  answer the question:</br><i>Does my application work in real life?</i>
</p>

---

It's a big question, and it can't be answered with small tests that
observe a tiny portion of your code that isn't integrated with any
thing else. Big questions need big tests.

> Bigtest is in the process of being extracted from several different
> projects and so it is very much in the "component pieces" phase. You
> can [use][1] [these][2] [pieces][3] [in][4] your own projects, but there
> is going to be some manual integration involved.

What does a big test look like?

### Real Applications

The surest way to know if an application is going to work is to
actually run it. Big tests boot the entire application before every
testcase.

### Real Browsers

Does your appication run in a browser? Then if a test is going to
measure whether it works or not, it also needs to run in a _real_
browser that a _real_ user might use, and it should dispatch _real_ UI
events against a _real_ DOM.

- [@bigtest/interaction][4]

### Real Asynchrony

Testing big is hard because there can be hundreds if not thousands of
things happening concurrently inside your application; including user
interactions.

- [@bigtest/convergence][1]
- [@bigtest/mocha][2]

### Real API Requests

Does your app make requests to an API? Then your tests should hammer
the network too. Otherwise, you're measuring air.

- [@bigtest/mirage][3]

[1]: packages/convergence
[2]: packages/mocha
[3]: packages/mirage
[4]: packages/interaction
