---
"@bigtest/atom": minor
---

Atom and Slice's `once` never returns undefined. The subscription never terminates, so an undefined value will never happen in practice.
