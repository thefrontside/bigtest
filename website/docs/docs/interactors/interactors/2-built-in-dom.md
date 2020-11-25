---
id: built-in-dom
title: Built-in Interactors
---

<!-- 
- 1-2 sentences of what they are
-->
These are the eight default interactors that are offered out-of-the-box with BigTest:
- [Page](/)
- [Button](/)
- [CheckBox](/)
- [Heading](/)
- [Link](/)
- [MultiSelect](/)
- [RadioButton](/)
- [Select](/)
- [TextField](/)

As you might have seen in the [Quick Start](/) section, you are able to import any of the interactors directly from the bigtest package:
```js
import { 
  Button, 
  TextField, 
  ... 
} from 'bigtest';
```

### Page Interactor
<!-- write about page interactor here -->

### Up Next

You can construct your own customer interactors which we will cover in the [Write Your Own Interactors](/) section. But first let's have a closer look at what locators, filters, and actions are. 