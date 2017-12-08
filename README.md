# BigTest [![CircleCI](https://circleci.com/gh/thefrontside/bigtest/tree/master.svg?style=svg&circle-token=78c5d879b0ace4fe137c203bfc9ca20d732eb6e3)](https://circleci.com/gh/thefrontside/bigtest/tree/master)

A Suite of JavaScript libraries and framework extensions to help you answer
the question: _Does my application work in real life?_.

It's a big question, and it can't be answered with small tests that
observe a tiny portion of your code that isn't integrated with any
thing else. Big questions need big tests.

> Bigtest is in the process of being extracted from several different
> projects and so it is very much in the "component pieces"
> phase. You can use [these][1] [pieces][2] in your own projects, but there is
> going to be some manual integration involved.

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

### Real Asynchrony

Testing big is hard because there can be hundreds if not thousands of
things happening concurrently inside your application; including user
interactions.

- [@bigtest/convergence][1]

### Real API Requests

Does your app make requests to an API? Then your tests should hammer
the network too. Otherwise, you're measuring air.

- [@bigtest/mirage][2]

[1]: packages/convergence
[2]: https://github.com/cowboyd/mirage-server
[3]: https://github.com/thefrontside/ui-eholdings
