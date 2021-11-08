---
"@bigtest/agent": patch
"@bigtest/globals": patch
"bigtest": patch
---

Use `setInteractionWrapper` from `@interactors/globals` to restrict from running interactions in assertions instead of checking runner state.
Add `visit` function
