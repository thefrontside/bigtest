# @bigtest/globals

The various bigtest components need to be able to interact with each other,
without explicitly depending on each other.  To share information between
components, we need to store some information in global variables. This small
component provides a wrapper so we don't need to rely on untyped global
variables in our packages.

To run the tests:

``` sh
$ yarn test
```
