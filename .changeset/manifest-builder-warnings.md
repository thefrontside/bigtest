---
"@bigtest/server": patch
---

Work around bug in node.js that throws warnings when using `fs.promises.truncate()`: https://github.com/nodejs/node/issues/34189
