---
id: assertions-matchers
title: Assertions and Matchers
---

## Assertions
<!-- bring assertions from filter section in previous page here -->

## Matchers
### strings(substring?|regexp?)
including `HTML({ title: including('') })`
matching  `HTML({ title: matching(/he(llo|ck/)) })`

### iterables(matcher?)
some `MultiSelect().has({ values: some('') })`
every `MultiSelect().has({ values: every('') })`

### combinators(matcher?)
and `HTML({ title: and('', '') })`
or `HTML({ title: or('', '') })`
not `HTML({ title: not('') })`