# @bigtest/inspector

## How to start

- `yarn prepack`

## How to use

- Add entry point to your app `@bigtest/inspector`
- In a browser devtools execute function `__BIGTEST_TOGGLE_INSPECTOR__` to show the inspector view
- On the left side are all matched built-in interactors to dom elements.
- On the right side you can write custom interactors by using `createInteractor` API or use built-in interactors to write action sequence

## What doesn't work yet

- Interactor actions execute synchronously, that blocks UI updates
- Add interactor snippets
