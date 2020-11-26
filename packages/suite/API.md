# BigTest Suite

Tools for working with BigTest test suites, including typings for all of the
elements of a test suite, helpers to validate a suite, as well as a DSL for
creating test suites.

## Typings

BigTest test suites are represented as a tree-like data structure. The exact
format of this data structure is described by the types in this packages. There
are three variations of this structure:

- {@link Test}: the baseline, which describes the common structure of a test suite,
  but does not include the ability to execute the test suite, or its results.
- {@link TestImplementation}: has the same structure as {@link Test}, but also
  includes the ability to execute the test suite. This is what is normally
  exported from a test file.
- {@link TestResult}: has the same structure as {@link Test}, but represents
  the result of running the test suite, and includes the results of each step
  and assertion as well as the aggregate results of test nodes.

## Using the DSL

When using the DSL you will usually import the {@link test} function and use it
as a starting point.

## Suite validation

See {@link validateTest}.
