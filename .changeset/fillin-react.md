---
"@bigtest/interactor": patch
"bigtest": patch
---

Workaround the fact that React > 15.6 monkey-patches the
HTMLInputElement `value` property as an optimization causing the
`fillIn()` action not to work. See
https://github.com/thefrontside/bigtest/issues/596
