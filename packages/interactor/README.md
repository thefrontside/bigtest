# @bigtest/interactor [![CircleCI](https://circleci.com/gh/bigtestjs/interactor/tree/master.svg?style=svg)](https://circleci.com/gh/bigtestjs/interactor/tree/master)

Synchronously interact with DOM elements using a
[convergence](https://github.com/bigtestjs/convergence)
interface.

## Convergent Interactions

This libarary uses convergences from
[`@bigtest/convergence`](https://github.com/bigtestjs/convergence)
to ensure that elements exist in the DOM before being interacted
with. As such, the `Interactor` class provided by this library
supports the `Convergence` methods  as well as interaction specific
ones.

``` javascript
import { Interactor } from '@bigtest/interactor';

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

### Available Interactions

**Getters**

- `.text`
- `.value`
- `.isVisible`
- `.isHidden`
- `.isPresent`

The interaction getters return the state of the scoped element.

**Methods**

- `.click(selector)`
- `.fill(selector, value)`
- `.select(selector, option)`
- `.focus(selector)`
- `.blur(selector)`
- `.trigger(selector, event, eventOptions)`
- `.scroll(selector, { left, top })`

The interaction methods can omit the `selector` and also interact
directly with the scoped element.

**Misc**

- `.find(selector)`
- `.findAll(selector)`

You may use the `.find` method to converge on an element
existing. That element is then passed on to the next convergence
method in the stack.

``` javascript
new Interactor('#login-page')
  .find('h1.heading')
  .when((h1) => h1.innerText === 'Log In')
  .do(() => console.log('looks good!'))
  .timeout(100)
```

The `.findAll` method passes on an array of elements found at the time
it was called. If it cannot find any elements matching `selector`, an
empty array is passed along instead.

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

**Getters**

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

All default interactor properties and methods may be overwritten
freely, with the exception of Convergence methods `when`, `always`,
`do`, `timeout`, `run`, `then`, `append`, and a reserved method,
`only`, meant for nested interactors.

**Methods**

- `clickable(selector)`
- `focusable(selector)`
- `blurrable(selector)`
- `triggerable(selector, event, eventOptions)`
- `fillable(selector) => function(value)`
- `selectable(selector) => function(option)`
- `scrollable(selector) => function({ left, top })`

Just like interactor methods, you may omit any `selector` to interact
directly with the root element. This root element is also available as
`interactor.$root` and is lazy just like other property getters.

**Misc**

- `scoped(selector, properties)`
- `collection(selector, properties)`

The `scoped` property returns an interactor scoped to the selector
nested within the current scope. The second argument, `properties`,
can either be an object or class defining property descriptors, or
another interactor class entirely.

``` javascript
@interactor class FormInteractor {
  input = scoped('input', {
    placeholder: property('placeholder')
  })
}

// fills the input's value and blur it
await new FormInteractor('form')
  .input.fill('some value')
  .input.blur()

// returns the placeholder of the form input, or throws
// an error when the element cannot be found
new Forminteractor('form').input.placeholder

// nested interactors can be severed from the parent
// chain using `.only()`
new FormInteractor('form').input.only()
  .focus().fill('value').blur()
```

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

### Extending Custom Interactors

All interactors inherit a static `extend` decorator. This can be used
in place of any `@interactor` to inherit from a custom interactor.

``` javascript
import {
  interactor,
  text,
  property,
  hasClass,
  clickable
} from '@bigtest/interactor';

@interactor class FieldInteractor {
  label = text('label');
  name = property('input', 'name');
  type = property('input', 'type');
  placeholder = property('input', 'placeholder');
}

@FieldInteractor.extend class PasswordInteractor {
  toggleVisibility = clickable('.toggle-visibility');
  isPasswordVisible = hasClass('.is-password-visibile');
}
```

### Without Decorators or Class Properties

While decorators and class properties are still not part of the
current JavaScript spec, you can use the static `from` method with a
plain object. This method is also inherited by custom interactors.

``` javascript
const LoginInteractor = Interactor.from({
  // static properties can be defined with a `static` object
  static: {
    defaultScope: '.login-form'
  },

  fillName: fillable('.name-input'),
  submit: clickable('.submit-btn'),

  // getters are copied over
  get errors() {
    return this.$$('.errors')
      .map($el => $el.innerText);
  },

  // methods too
  fillName(name) {
    return this
      .focus('.name-input')
      .fill('.name-input', name)
      .blur('.name-input');
  }
});
```
