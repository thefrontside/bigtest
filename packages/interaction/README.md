# @bigtest/interaction

Synchronously interact with DOM elements using a
[convergence](https://github.com/thefrontside/bigtest/tree/master/packages/convergence)
interface.

## Convergent Interactions

This libarary uses convergences from
[`@bigtest/convergence`](https://github.com/thefrontside/bigtest/tree/master/packages/convergence)
to ensure that elements exist in the DOM before being interacted
with. As such, the `Interaction` class provided by this library
supports the `Convergence` methods  as well as interaction specific
ones.

``` javascript
import { Interaction } from '@bigtest/interaction';

let logIn = new Interaction('#login-form')  // optional scope selector
  .fill('.email-input', 'email@domain.tld') // fills in an email
  .blur('.email-input')                     // triggers blur validation
  .fill('.pass-input', '5up3rS3cr37')       // fills in a password
  .click('.submit-btn')                     // submits the form
  .once(() => !!user.loggedIn)              // ensures we've logged in

// runs the interaction and bails if it cannot complete in 1 second
logIn.timeout(1000).run()
  // .run() returns a promise
  .then(() => {...})  // user has been logged in
  .catch(() => {...}) // something went wrong along the way

// interactions are immutable and can be run multiple times
logIn.do(() => console.log('logged in')).timeout(500).run()
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
new Interaction('#login-page')
  .find('h1.heading')
  .once((h1) => h1.innerText === 'Log In')
  .do(() => console.log('looks good!'))
  .timeout(100)
  .run()
```

Similarly, there is `.findAll(selector)`, but this method does not
converge on elements existing. Instead it will return an empty array
if it cannot find any elements matching `selector`.

### Custom Interactions

You can create custom interactions by extending the `Interaction` class:

``` javascript
class CustomInteraction extends Interaction {
  logIn(email, password) {
    return this
      .fill('.email-input', email)
      .blur('.email-input')
      .fill('.pass-input', password)
      .click('.submit-btn')
  });
}

new CustomInteraction()
  .logIn('email@domain.tld', '5up3rS3cr37')
  .timout(500)
  .run()
```

## Page Objects

`@bigtest/interaction` also provides support for creating page-objects
consisting of custom interactions.

A `@bigtest/interaction` page-object can be created by using the
`page` class decorator and defining property initializers using the
various page-object property helpers.

``` javascript
/* tests/pages/login-page.js */

import {
  page,
  text,
  count,
  isVisible,
  fillable,
  blurrable,
  clickable
} from '@bigtest/interaction';

export default @page class LoginPage {
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

The `*able` helpers provide methods that return a custom interaction
specific to this page-object. This custom interaction can then be
chained with other methods defined using the `*able` helpers. To kick
off the interaction you must call `.run()`, which returns a
promise. But if you're using `@bigtest/mocha`, it will automatically
call `.timeout()` and `.run()` for you when you return an object with
a convergence-like interface.

The other page-object property helpers return getters for lazily
returning the desired results. If the element does not exist when the
getter is accessed, it will immediately throw an error.

``` javascript
/* tests/login-test.js */

// @bigtest/mocha has support for auto-running convergences
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import LoginPage from './pages/login-page'

// You can use a single page-object class for multiple scoped instances
let loginPage = new LoginPage('#login-page');

describe('Logging in', () => {
  // if this getter throws an error, @bigtest/mocha's convergent it
  // will keep running this assertion until it passes or the timeout
  // is almost met
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

### Available Page Object Properties

**Getters:**

- `find(selector)`
- `findAll(selector)`
- `text(selector)`
- `value(selector)`
- `count(selector)`
- `property(prop, selector)`
- `attribute(attr, selector)`
- `isVisible(selector)`
- `isHidden(selector)`
- `isPresent(selector)`
- `is(match, selector)`
- `hasClass(selector)`

**Methods**

- `clickable(selector)`
- `focusable(selector)`
- `blurrable(selector)`
- `triggerable(event, selector, eventOptions)`
- `fillable(selector) => function(value)`
- `scrollable(selector) => function({ left, top })`

Just like interactions, you may omit any `selector` to interact
directly with the root page-object element. This root element is also
available as `pageObject.$root` and is lazy just like other
page-object getters.

In addition to all of the above properties, page-objects also have
default methods named according to their interaction counterparts.

For example:

``` javascript
new PageObject().click('.btn') //=> custom interaction
```

And again, by omitting `selector`, you can interact directly with the
`$root` element.

``` javascript
new PageObject('#welcome-page').scroll({ top: 1000 })
```

**Misc**

- `collection(selector, properties)`

The `collection` property is a method that returns the item at an
index. This item is just like another scoped page-object that has it's
own properties defined by the second argument.

``` javascript
@page class PageObject {
  items = collection('li', {
    title: text('p'),
    select: click('a')
  })
}

// will throw if the index cannot be found
let item = new PageObject('ul').items(2);

item.title    //=> text content of `ul li p`
item.select() //=> interaction specific to this item instance

// an array of all items may be returned by omitting the index
let allItems = new PageObject('ul').items();
```

### Custom Page Object Properties

Methods defined in a page-object class can reference any page-object
properties and chain interactions together. The custom interaction
does not recieve these methods, so these custom-defined methods must
be called directly from the page-object.

``` javascript
@page class PageObject {
  selectRadio(value) {
    return this
      .click(`input[type="radio"][value="${value}"]`)
      .click('button[type="submit"]')
  }
}

new PageObject().selectRadio('yes').run()
```

You may also define custom page-object properties using the provided
property helpers. Methods added using `action` will also be made
available on interaction instances returned from other methods.

``` javascript
import { page, action, computed } from '@bigtest/interaction'

let doubleClickable = (selector) => {
  return action(function() {
    return this
      .find(selector)
      .click()
      .click()
  });
};

@page class PageObject {
  clicky = doubleClickable('.btn');
  title = computed(() => document.title);
}

new PageObject()
  .fill('input', 'name')
  .clicky() // calls the custom property

new PageObject().title // returns the document's title
```

### Without Decorators or Property Initializers

While decorators and property initializers are still not part of the
current JavaScript spec, you can still use these helpers in a more
traditional manner:

``` javascript
const PageObject = page(class PageObject {
  constructor() {
    this.fillName = fillable('.name-input');
    this.submit = clickable('.submit-btn');
  }
});
```
