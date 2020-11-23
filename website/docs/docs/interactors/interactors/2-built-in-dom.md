---
id: built-in-dom
title: Built-in Interactors
---

<!-- 
- 1-2 sentences of what they are
-->
These are the eight default interactors that are offered out-of-the-box with BigTest:
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

<!-- 
- List of all available interactors
  - there is also Page interactor but idk if that should be mentioned here 
  - Either the list above links to API or we have an example of each. Or maybe both.
    - I think a link to the API would be best
-->

<!--
- One example
  - Because the focus is on just showing people how to import, I didn't think it would be necessary to show both jest and cypress here.
  - and also we're covering locators, filters, actions in the next section so i kept the example simple.
-->

You can construct your own customer interactors which we will cover in the [Write Your Own Interactors](/) section. But first let's have a closer look at what locators, filters, and actions are. 

<!-- 
- Make sure to make it clear that people can and should write their own interactors.
-->