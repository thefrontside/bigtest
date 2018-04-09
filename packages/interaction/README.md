# @bigtest/interaction

Synchronously interact with DOM elements using a
[convergence](https://github.com/thefrontside/bigtest/tree/master/packages/convergence)
interface.

## Convergent Interactions

This libarary uses convergences from
[`@bigtest/convergence`](https://github.com/thefrontside/bigtest/tree/master/packages/convergence)
to ensure that elements exist in the DOM before being interacted
with. As such, the `Interactor` class provided by this library
supports the `Convergence` methods  as well as interaction specific
ones.

``` javascript
import { Interactor } from '@bigtest/interaction';

let logIn = new Interactor('#login-form')   // optional scope selector
  .fill('.email-input', 'email@domain.tld') // fills in an email
  .blur('.email-input')                     // triggers blur validation
  .fill('.pass-input', '5up3rS3cr37')       // fills in a password
  .click('.submit-btn')                     // submits the form
  .when(() => !!user.loggedIn)              // ensures we've logged in

// runs the interactor and bails if it cannot complete in 1 second
logIn.timeout(1000).run()
  // .run() returns a promise
  .then(() => {...})  // user has been logged in
  .catch(() => {...}) // something went wrong along the way

// interactors are immutable and can be run multiple times
await logIn.do(() => console.log('logged in')).timeout(500)
```

### Available Interaction Methods

- `.click(selector)`
- `.fill(selector, value)`
- `.focus(selector)`
- `.blur(selector)`
- `.trigger(selector, event, eventOptions)`
- `.scroll(selector, { left, top })`

These interaction methods can omit the `selector` and interact
directly with the scoped element of the interaction.

In addition to the above, you may use the `.find(selector)` method
to converge on an element existing. That element is then passed on to
the next convergence method in the stack.

``` javascript
new Interactor('#login-page')
  .find('h1.heading')
  .when((h1) => h1.innerText === 'Log In')
  .do(() => console.log('looks good!'))
  .timeout(100)
```

Similarly, there is `.findAll(selector)`, but this method does not
converge on elements existing. Instead it will return an empty array
if it cannot find any elements matching `selector`.

## Custom Interactors

You can create custom interactors by extending the `Interactor` class:

``` javascript
class CustomInteractor extends Interactor {
  logIn(email, password) {
    return this
      .fill('.email-input', email)
      .blur('.email-input')
      .fill('.pass-input', password)
      .click('.submit-btn')
  });
}

await new CustomInteractor()
  .logIn('email@domain.tld', '5up3rS3cr37')
  .timout(500)
  .run()
```

You can also create custom interactors by using the `interactor` class
decorator along with interaction helpers:

``` javascript
/* tests/pages/login-page.js */

import {
  interactor,
  text,
  count,
  isVisible,
  fillable,
  blurrable,
  clickable
} from '@bigtest/interaction';

export default @interactor class LoginPageInteractor {
  heading = text('h1.heading');
  errors = count('p.login-error')
  fillEmail = fillable('.email-input');
  blurEmail = blurrable('.email-input');
  fillPass = fillable('.pass-input');
  submit = clickable('.submit-btn');
  isLoggedIn = isVisible('.login-message.success')

  login(email, password) {
    return this
      .fillEmail(email)
      .blurEmail()
      .fillPass(password)
      .submit();
  }
}
```

The `*able` interaction helpers provide methods that return new
instances of the custom interactor. This instance can then be chained
with other methods created with `*able` helpers.

The other property helpers return getters for lazily returning the
desired results. If the element does not exist when the getter is
accessed, it will immediately throw an error.

``` javascript
/* tests/login-test.js */

// @bigtest/mocha uses convergent assertions
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import LoginPageInteractor from './pages/login-page'

// You can use a single interactor class for multiple scoped instances
let loginPage = new LoginPageInteractor('#login-page');

describe('Logging in', () => {
  // if this getter throws an error, @bigtest/mocha's convergent it
  // will keep running this assertion until it passes or the timeout
  // is exceeded
  it('has a "log in" heading', () => {
    expect(loginPage.heading).to.eq('Log In');
  });

  describe('with an invalid email', () => {
    // no need to call .timeout() or .run() since
    // @bigtest/mocha will do that for us
    beforeEach(() => {
      return loginPage
        .fillEmail('email@domain')
        .blurEmail()
    });

    it('has errors', () => {
      expect(loginPage.errors).to.eq(1);
    });

    it('does not log in', () => {
      expect(loginPage.isLoggedIn).to.be.false;
    });
  });

  describe('with an email and password', () => {
    beforeEach(() => {
      return loginPage.login('email@domain.tld', '5up3rS3cr37')
    });

    it('has no errors', () => {
      expect(loginPage.errors).to.eq(0);
    });

    it('logs in', () => {
      expect(loginPage.isLoggedIn).to.be.true;
    });
  });
});
```

### Available Helpers

**Getters:**

- `find(selector)`
- `findAll(selector)`
- `text(selector)`
- `value(selector)`
- `count(selector)`
- `property(selector, prop)`
- `attribute(selector, attr)`
- `isVisible(selector)`
- `isHidden(selector)`
- `isPresent(selector)`
- `is(selector, match)`
- `hasClass(selector)`

**Methods**

- `clickable(selector)`
- `focusable(selector)`
- `blurrable(selector)`
- `triggerable(selector, event, eventOptions)`
- `fillable(selector) => function(value)`
- `scrollable(selector) => function({ left, top })`

Just like interactor methods, you may omit any `selector` to interact
directly with the root element. This root element is also available as
`interactor.$root` and is lazy just like other property getters.

**Misc**

- `collection(selector, properties)`

The `collection` property is a method that returns the item at an
index. This item is just like another scoped interactor that has it's
own properties defined by the second argument.

``` javascript
@interactor class ListInteractor {
  items = collection('li', {
    title: text('p'),
    select: click('a')
  })
}

// clicks the 2nd indexed item's anchor element
await new ListInteractor('ul')
  .items(2).select()

// returns the text content of `ul li p`, or throws
// an error when the element cannot be found
let itemTitle = new Listinteractor('ul').items(2).title

// an array of all items may be returned by omitting the index
let allItems = new ListInteractor('ul').items();
```

### Custom Properties

Methods and getters defined in an interactor class work as expected

``` javascript
@interactor class PageInteractor {
  selectRadio(value) {
    return this
      .click(`input[type="radio"][value="${value}"]`)
      .click('button[type="submit"]')
  }
}

await new PageInteractor().selectRadio('yes')
```

You can also create custom property helpers using the `action` and
`computed` helpers.

``` javascript
import { interactor, action, computed } from '@bigtest/interaction'

let doubleClickable = (selector) => {
  return action(function() {
    return this
      .find(selector)
      .click()
      .click()
  });
};

@interactor class PageInteractor {
  clicky = doubleClickable('.btn');
  title = computed(() => document.title);
}

new PageInteractor()
  .fill('input', 'name')
  .clicky() // calls the custom property

new PageInteractor().title // returns the document's title
```

### Without Decorators or Property Initializers

While decorators and property initializers are still not part of the
current JavaScript spec, you can still use these helpers in a more
traditional manner:

``` javascript
const PageInteractor = interactor(class PageInteractor {
  constructor() {
    this.fillName = fillable('.name-input');
    this.submit = clickable('.submit-btn');
  }
});
```
