---
"@bigtest/interactor": minor
---

Interactor actions functions now receive the interactor, supporting composition of
interactors within an action:

```
const Datepicker = createInteractor<HTMLDivElement>("datepicker")({
  // ...
  actions: {
    toggle: async interactor => {
      await interactor.find(TextField.byPlaceholder("YYYY-MM-DD")).click();
    }
  }
});
```

The `resolve()` method on `Interactor` has been replaced with a `perform()` method:

```
const Link = createInteractor<HTMLLinkElement>("link")({
  // ...
  actions: {
    click: async interactor => {
      await interactor.perform(element => element.click());
    }
  }
});
```

Or more simply with the new `perform()` helper function:


```
import { createInteractor, perform } from "@bigtest/interactor";

const Link = createInteractor<HTMLLinkElement>("link")({
  // ...
  actions: {
    click: perform(element => element.click())
  }
});
```