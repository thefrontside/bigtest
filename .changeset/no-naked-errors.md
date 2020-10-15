---
"@bigtest/cli": patch
"bigtest": patch
---

When an unexpected error happens in the CLI, catch it, let the user
know it is our fault, and generate a link to a github issue containing
diagnostic information
