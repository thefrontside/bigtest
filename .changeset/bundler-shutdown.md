---
"@bigtest/bundler": patch
---

The `try`/`finally` in `Bundler` was not wrapping the code that it should have; switch to using `ensure()` API.