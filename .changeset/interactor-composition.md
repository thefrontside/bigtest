---
"@bigtest/interactor": minor
---

Interactor actions functions now receive an interface containing the `interactor` and `element`,
supporting composition of interactors within an action:

```
const Datepicker = createInteractor<HTMLDivElement>("datepicker")({
  // ...
  actions: {
    toggle: async ({ interactor, element }) => {
      await interactor.find(TextField.byPlaceholder("YYYY-MM-DD")).click();
    }
  }
});
```