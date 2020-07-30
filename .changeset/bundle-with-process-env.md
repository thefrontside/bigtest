---
"@bigtest/bundler": minor
"@bigtest/cli": patch
---
set process.env.NODE_ENV='production' inside the test bundle. This
will ensure that 3rd party packages that depend on this will continue
to function
