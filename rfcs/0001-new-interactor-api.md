---
Start Date: 2020-01-28
RFC PR: (leave this empty)
GitHub Issue: (leave this empty)
---

- [Summary](#summary)
- [Basic example](#basic-example)
- [Motivation](#motivation)
  - [Decorators](#decorators)
- [Detailed design](#detailed-design)
  - [🧅 Layered abstraction](#-layered-abstraction)
    - [Using an Interactor](#using-an-interactor)
    - [Creating an Interactor](#creating-an-interactor)
    - [Selecting elements for an Interactor](#selecting-elements-for-an-interactor)
  - [🤏 Natural element selection](#-natural-element-selection)
  - [🕹 Actions & computed properties](#-actions--computed-properties)
  - [⛓ Chaining](#-chaining)
  - [💥 Detailed failure handling](#-detailed-failure-handling)
    - [Selector failures](#selector-failures)
    - [Action errors](#action-errors)
    - [Developer error](#developer-error)
  - [🧐 High-fidelity typing](#-high-fidelity-typing)
  - [🌲 Compound interactors](#-compound-interactors)
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

However, it would be possible to touch the elements directly and do the same
thing:

```ts
const MyButton = interactor(buttonSelector, ({ subject }) => {
  return {
    press() {
      const element = await subject.first;
      element.click();
    }
  };
});
```

Using the `subject` directly should be considered a tool for low-level base
`Interactor`s, or otherwise an escape hatch. If there is no existing lower level
base `Interactor` to take care of your needs, you should consider making one
rather than risking coupling a higher level `Interactor` to the element
structure.

#### Selecting elements for an Interactor

`Selector`s are functions which return a collection of elements (optionally
wrapped in a `Promise`). The elements can be anything, not just DOM nodes. For
example, if you are using Puppeteer, `Interactor`s can be used in the Node
environment and use `ElementHandle`s instead of `HTMLElement`s.

```ts
const buttonSelector = selector<Element, HTMLButtonElement>(
  (locator, container) =>
    Array.from(container.querySelectorAll("button")).filter(
      btn => btn.innerText === locator
    )
);
```

```ts
const buttonSelector = (type = "submit") =>
  selector<Element, HTMLButtonElement>((locator, container) =>
    Array.from(container.querySelectorAll(`button[type=${submit}]`)).filter(
      btn => btn.innerText === locator
    )
  );
```

```ts
const labelSelector = selector<Element, HTMLLabelElement>(
  (locator, container) => {
    return Array.from(container.querySelectorAll("label")).filter(
      lbl => lbl.innerText.trim() === locator
    );
  }
);

const datepickerSelector = selector<Element, HTMLDivElement>(
  (locator, container) => {
    const labels = await labelSelector(locator, container);

    return labels.map(label => label.closest("[data-test-datepicker]"));
  }
);
```

### 🤏 Natural element selection

### 🕹 Actions & computed properties

```ts
const Datepicker = interactor(datepickerSelector, ({ locator, subject }) => {
  const input = Input(locator, subject);
  return {
    async choose(yyyy: number, mm: number, dd: number) {
      await input.click();
    },
    get value() {
      return input.value;
    }
  };
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

There are three ways an `Interactor` can fail. An `Interactor` may fail to find
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

Unlike `Selector`s, which are pure and run repeatedly until success or timeout,
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

### 🌲 Compound interactors

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
