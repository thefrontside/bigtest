---
Start Date: 2020-01-28
RFC PR: https://github.com/bigtestjs/bigtest/pull/40
GitHub Issue: (leave this empty)
---

- [Summary](#summary)
- [Basic example](#basic-example)
- [Motivation](#motivation)
  - [Beyond CSS selectors](#beyond-css-selectors)
  - [High-fidelity typing](#high-fidelity-typing)
  - [Decorators](#decorators)
- [Detailed design](#detailed-design)
  - [🧅 Layered abstraction](#-layered-abstraction)
    - [Using an Interactor](#using-an-interactor)
    - [Creating an Interactor](#creating-an-interactor)
    - [Selecting elements for an Interactor](#selecting-elements-for-an-interactor)
  - [⛓ Chaining](#-chaining)
  - [💥 Detailed failure handling](#-detailed-failure-handling)
    - [Selector failures](#selector-failures)
    - [Action errors](#action-errors)
    - [Developer error](#developer-error)
  - [🧐 High-fidelity typing](#-high-fidelity-typing)
- [Drawbacks](#drawbacks)
- [Alternatives](#alternatives)
- [Adoption strategy](#adoption-strategy)
- [How we teach this](#how-we-teach-this)
- [Unresolved questions](#unresolved-questions)

## Summary

Brief explanation of the feature.

## Basic example

If the proposal involves a new or changed API, include a basic code example.
Omit this section if it's not applicable.

## Motivation

Why are we doing this? What use cases does it support? What is the expected
outcome?

Please focus on explaining the motivation so that if this RFC is not accepted,
the motivation could be used to develop alternative solutions. In other words,
enumerate the constraints you are trying to solve without coupling them too
closely to the solution you have in mind.

### Beyond CSS selectors

### High-fidelity typing

### Decorators

Decorators are all but required for the current API. There is an escape hatch—
`Interactor.from()`—but it's an escape hatch, not the happy path. This is not
great because of the
[current state of the TC39 decorator proposal](https://github.com/tc39/proposal-decorators#faq).

## Detailed design

Less component-centric, more user-centric.

### 🧅 Layered abstraction

#### Using an Interactor

This is the highest level of the API, and the one which is used directly in the
tests. The details of the object being poked at are completely obscured. It
could be an `ElementHandle` from Playwright or Puppeteer or it could be an
`HTMLElement` from the DOM. It doesn't matter.

You can see in the following example that we are selecting a button using its
text "Submit". Then we are calling an `Action` on it called `press`, which
returns both a `PromiseLike` interface and the `Interactor`'s interface so it
can be chained (more on chaining below) and more actions may be called in
sequence.

```ts
await MyButton("Submit").press();
```

Note that the `Locator`—the `string` we pass to the `Interactor` function—can
represent different things based on the `Selector` used in the `Interactor`.
More on `Selector`s later, but for now know that they are flexible and generic.

`Interactor`s may also have computed properties. Computed properties return a
value wrapped in a `Promise` and are not chainable. They should be free of
side-effects.

```ts
await expect(MyButton("Submit").isDisabled).resolves.toBe(true);
```

#### Creating an Interactor

Component libraries shipping specialized components may want to also ship
alongside them specialized `Interactor`s.

To create an `Interactor` we use the `interactor()` function. This function
takes a `Selector` function as its first argument. The `Selector` is responsible
for selecting elements using the `Locator` given at the time of invocation. The
second argument is a function which receives a `Context` object and
synchronously returns an interface containing `Action`s and computed properties.

At this level we have access to the objects the `Selector` finds, however we
still do not necessarily need to touch them directly. To avoid coupling the
`Interactor` tightly to the UI's structure, other more granular `Interactor`s
may be used:

```ts
const MyButton = interactor(buttonSelector, context => {
  const button = Button.from(context);

  return {
    async press() {
      await button.click();
    }
  };
});
```

The above wraps the `Subject` with a different `Interactor` called `Button`. In
this case `MyButton` is some custom `Interactor` for our custom button component
that likes to be pressed instead of clicked. This API allows us to extend, as it
were, more primitive `Interactor`s.

We can also compose `Interactor`s:

```ts
const Datepicker = interactor(
  css,
  ({ locator, subject }) => {
    return {
      async nextMonth() {
        await Button("Next month", subject).click();
      },
      async previousMonth() {
        await Button("Previous month", subject).click();
      },
      async selectDay(day: number) {
        await Button(day.toString(), subject).click();
      },
      get currentMonth() {
        return Element("[data-test-month]", subject).text;
      },
      get currentYear() {
        return Element("[data-test-year]", subject).text;
      },
      get selectedDay() {
        return Element("[data-test-selected-day]", subject).text;
      },
      get today() {
        return Element("[data-test-today]", subject).text;
      }
    };
  },
  { locator: "[data-test-datepicker]" }
);
```

If we need to we can use the `Subject` directly. This API should be left for
primitive `Interactor`s:

```ts
const Button = interactor(buttonSelector, ({ subject }) => {
  return {
    async click() {
      const element = await subject.first;
      element.click();
    }
  };
});
```

The `Subject` interface has two computed properties: `first` and `all`. They
both return `Promise`s. When a `Selector` selects and returns a collection of
elements, that collection is wrapped in the `Subject` interface. In most cases
we will just want the first element of the collection (as there will be but a
single match), but sometimes we may want to do something with all matches. We
may access these elements with the `all` property, which returns a
`Promise`-wrapped array of elements.

```ts
const Element = interactor(css, ({ subject }) => {
  return {
    get count() {
      return subject.all.then(elems => elems.length);
    }
  };
});

await Element("div").count; // => 26742069856
```

#### Selecting elements for an Interactor

This layer is the lowest level of the public API. It involves dealing with the
details of navigating the DOM and so forth in order to supply elements for the
`Interactor`s to operate upon.

`Selector`s are functions which return a collection of elements (optionally
wrapped in a `Promise`). The elements can be anything, not just DOM nodes. For
example, if we are using Puppeteer, `Interactor`s can be used in the Node
environment and use `ElementHandle`s instead of `HTMLElement`s.

The `selector()` function is a light wrapper around our `Query` function which
queries the given container for elements. `selector()` returns a `Selector`
function which, when called, will retry the `Query` until until it returns a
non-empty collection of elements or it times out. If nothing is found it will
throw an error.

The first parameter of the `Query` function is the `Locator` that was passed to
the `Interactor`, the second argument is the `Container` element. The
`Container` may come from the `Interactor` declaration as a default, or it may
be passed into the `Interactor` as a second argument after the `Locator`. When
done the latter way, it will override the former default `Container`. The
details of where the `Container` is coming from are unimportant to a `Selector`
author.

As a simple example, here is a `Selector` which selects `HTMLButtonElement`s by
`innerText` that contains the `Locator`.

```ts
const buttonSelector = selector<Element, HTMLButtonElement>(
  (locator, container) =>
    Array.from(container.querySelectorAll("button")).filter(
      btn => btn.innerText.indexOf(locator) >= 0
    )
);
```

With something like Playwright it could look like this:

```ts
const buttonSelector = selector<ElementHandle, ElementHandle>(
  (locator, container) => container.$$(`//button[contains(., '${locator}')]`)
);
```

The `Selector` dictates what it expects the type of the `Container` to be by
using type annotations. The first type parameter in `selector()` is the
`Container`'s type, while the second parameter is the return type.

These types bubble up into the `Interactor`, meaning that if one tries to
provide a `Container` to the `Interactor` which does not match the type required
by the `Selector`, there will be a type error.

We can also make higher-order `Selector`s if we need to "configure" the
`Selector`:

```ts
const buttonSelector = (type = "submit") =>
  selector<Element, HTMLButtonElement>((locator, container) =>
    Array.from(container.querySelectorAll(`button[type=${type}]`)).filter(
      btn => btn.innerText.indexOf(locator) >= 0
    )
  );
```

Or we can compose `Selector`s together to create more complex `Selector`s:

```ts
const labelSelector = selector<Element, HTMLLabelElement>(
  (locator, container) => {
    return Array.from(container.querySelectorAll("label")).filter(
      label => label.innerText.indexOf(locator) >= 0
    );
  }
);

const containerWithLabelSelector = (containerSelector: string) =>
  selector<Element, HTMLDivElement>((locator, container) => {
    const labels = await labelSelector(locator, container);
    return compact(labels.map(label => label.closest(containerSelector)));
  });
```

### ⛓ Chaining

```ts
await Input("Email")
  .fill("robbie@example.com")
  .tab();

// is equivalent to

await Input("Email").fill("robbie@example.com");
await Input("Email").tab();
```

### 💥 Detailed failure handling

There are three ways an `Interactor` may fail. An `Interactor` may fail to find
the desired element(s) within the timeout, an `Action` may error while acting
upon the resolved `Subject`, or the API may be used incorrectly.

#### Selector failures

If a `Selector` fails to find any matching elements (i.e. it returns an empty
`Iterable`) a generic error is thrown:
`'Did not find any matches with locator "${locator}"'`. However, it is
encouraged that `Selector` authors supply a more detailed, specific error
message. Since a `Selector` is just a function, it may throw errors at different
points of the element selection algorithm:

```ts
const input = selector((locator, container) => {
  const labels = throwIfEmpty(
    Array.from(container.querySelectorAll("label")),
    "Did not find any `<label>` elements"
  );
  const matchedLabels = throwIfEmpty(
    labels.filter(label => label.innerText.trim() === locator),
    `Found \`<label>\` elements but did not find any with text "${locator}"`
  );
  const inputs = throwIfEmpty(
    compact(matchedLabels.map(label => label.control)),
    `No controls could be found for labels matching "${locator}"`
  );

  return inputs;
});
```

As selectors are retried until they are successful or time-out, the last error
to occur is the one that is surfaced.

#### Action errors

Unlike `Selector`s, which are pure and run repeatedly until success or time-out,
`Action`s can only be run once since they are effectual. This means that the
first time an `Action` errors, the error will surface and fail the test. It will
not be retried.

For example, calling the `press()` action on the following `Interactor` will
immediately cause a test failure with the same error. For this reason,
`Interactor` authors are encouraged to handle possible error conditions and
throw helpful errors.

```ts
const MyButton = interactor(buttonSelector, () => {
  return {
    press() {
      throw new Error("💥");
    }
  };
});
```

One error that an `Interactor` author does not need to handle is if the selector
fails to find matches. This will cause the test to fail before the `Action` is
reached.

#### Developer error

The API is designed to guide the developer down the happy path using
high-fidelity types, simple interfaces that plug together intuitively, and a
single convention rather than a grab bag of different ways to do the same thing.

However, it is still possible to transgress the API. For example, as stated
earlier, `Action`s are for effects and computed properties should be pure. To
enforce this, in part at least, a helpful error is thrown if a value other than
`void` or `Promise<void>` is returned from an `Action`. I am unsure how to
enforce the purity of a computed property.

We will need to see if any other common mistakes arise which produce unhelpful
errors. It could mean an API adjustment or just a better error message.

### 🧐 High-fidelity typing

## Drawbacks

Why should we _not_ do this? Please consider:

- implementation cost, both in term of code size and complexity
- whether the proposed feature can be implemented in user space
- the impact on teaching people React
- integration of this feature with other existing and planned features
- cost of migrating existing React applications (is it a breaking change?)

There are tradeoffs to choosing any path. Attempt to identify them here.

## Alternatives

What other designs have been considered? What is the impact of not doing this?

## Adoption strategy

If we implement this proposal, how will existing developers adopt it? Is this a
breaking change? Can we write a codemod? Should we coordinate with other
efforts?

## How we teach this

What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing patterns?

Would the acceptance of this proposal mean that the documentation must be
re-organized or altered?

How should this feature be taught to existing developers?

## Unresolved questions

Optional, but suggested for first drafts. What parts of the design are still
TBD?
