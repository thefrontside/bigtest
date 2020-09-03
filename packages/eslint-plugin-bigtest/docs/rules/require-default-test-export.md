# Require all test files to have a default export (`require-default-export`)

Bigtest must find a default export

## Rule Details

This rule triggers a warning if a test file does not export a
top-level default bigtest `test`.

```typescript
import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export default test('Passing Test')
  .step("first step", delay())
```

Named exports are not allowed:

```typescript
import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export const tests = test('Passing Test')
  .step("first step", delay())
```
## When Not To Use It

Don't use this rule on non-bigtest test files.