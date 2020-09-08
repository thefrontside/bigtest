---
"@bigtest/interactor": minor
---

Support nullary interactors for singleton elements:

```
const MainNav = createInteractor('button')({
  selector: '#main-nav'
});

MainNav().click('Widgets');
```
