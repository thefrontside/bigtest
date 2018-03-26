# @bigtest/convergence

Recognize a desired state and synchronize on when that state has been achieved.

## Why Convergence?

Let's say you want to write an assertion to verify a simple cause and
effect: when a certain button is clicked, a dialog appears containing
some text that gets loaded from the network.

In order to do this, you have to make sure that your assertion runs
_after_ the effect you're testing has been realized.

![Image of assertion after an effect](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/assertion-after.png)

If not, then you could end up with a false negative, or "flaky test"
because you ran the assertion too early. If you'd only waited a little
bit longer, then your test would have passed. So sad!

![Image of false negative test](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/false-negative.png)

In fact, test flakiness is the reason most people shy away from
writing big tests in JavaScript in the first place. It seems almost
impossible to write robust tests without having visibility into the
internals of your runtime so that you can manually synchronize on
things like rendering and data loading. Unfortunately, those can be a
moving target, and worse, they couple you to your framework.

But what if instead of trying to run our assertions at just the right
time, we ran them _many_ times until they either pass or we decide to
give up?

![Image of convergent assertion](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/convergent-assertion.png)

This is the essence of what `@bigtest/convergence` provides:
repeatedly testing for a condition and then allowing code to run when
that condition has been met.

And it isn't just for assertions either. Because it is a general
mechanism for synchronizing on any observed state, It can be used to
properly time test setup and teardown as well.

## Creating a Convergence

A convergent function is a function that runs repeatedly until it no
longer returns false or throws an error. When the function is finally
successfully executed, it is considered to be passing and a converging
promise will resolve. However, if the converging function does not pass
within the provided timeout period the promise will reject with the
last error thrown from the function.

### Using `Convergence`

The `Convergence` class allows you to create a convergence, add
assertions to converge on, and execute the convergent assertions all
within a single timeout period.

``` javascript
import Convergence from '@bigtest/convergence'

// starts a new stack
new Convergence()
  // adds a convergent function to the stack
  .when(() => expect($el).to.exist)
  // called when the previous function converges
  .do(() => $el.get(0).click())
  // adds a convergent function that resolves when it is true
  // for the remaining timeout period
  .always(() => expect($el).to.have.prop('disabled', true))
  // starts converging and returns a promise that resolves
  // when all convergences have been met
  .run()
```

#### Immutability

`Convergence` has an immutable interface, so it's methods will
return new instances.

``` javascript
// will converge when the total equals 5
let convergeWhen = new Convergence()
  .when(() => total === 5);

// will log the total after the first convergence
let convergeAndLog = convergeWhen
  .do(() => console.log(total));

// after logging the total, will converge when it remains 5 for the
// duration of the remaining timeout
let convergeAlways = convergeAndLog
  .always(() => total === 5);

// all three convergences can be ran in parallel
convergeWhen.run();
convergeAndLog.run();
convergeAlways.run();
```

_Note: `.run()` does not return a new instance, instead it returns a promise._

---

#### Syntax

``` javascript
new Convergence([timeout = 2000]);
```

#### Parameters

**`timeout`**

You can define the convergences total timeout during initialization of
a `Convergence` instance. This timeout will be used for the set of
convergent functions unless the `.timeout()` method is used to change
the total timeout period.

``` javascript
let converge = new Convergence(1000);
```

#### Methods

**`.timeout([timeout])`**

Given a timeout (in `ms`), the `.timeout()` method will return a new
`Convergence` instance with the new timeout period replacing the old
one. When no argument is given, this method will return the current
timeout period of the convergence.

``` javascript
let convergeLong = converge.timeout(5000);

converge.timeout();  // => 1000
convergeLong.timeout(); // => 5000
```

**`.when(assert)`**

Returns a new `Convergence` instance and adds the provided assertion
to its stack. When this instance is ran, the `assert` function will be
looped over repeatedly until it passes, or until the convergence's
timeout has been exceeded.

``` javascript
// this convergence will resolve when `total` equals `5`
converge.when(() => total === 5)
```

**`.always(assert[, timeout])`**

Another common pattern is asserting that something **has not**
changed. With a typical convergence, the state may change after an
assertion converges immediately. So for these scenarios, you want to
converge _when the assertion passes for the duration of a timeout._
`.always()` is just like `.when()` above, except that the `assert`
function is looped over repeatedly until it fails for the first time
or never fails for the duration of the timeout.

``` javascript
// this convergence will resolve when total is always 5
// for the duration of the remaining timeout
converge.always(() => total === 5)
```

When a convergence added with `.always()` is last in the stack, it
will be given the remaining total timeout to converge on its assertion
always passing. When it _is not_ last in the stack, `timeout` is used
instead. By default, `timeout` will be a tenth of the total timeout
or `20ms` (whichever is greater).

``` javascript
converge
  // will be given any remaining timeout
  .always(() => total === 5)

converge
  // will use the 500ms timeout instead
  .always(() => total === 5, 500)
  .when(() => total === 10)

new Convergence(2000)
  // defaults to 200ms
  .always(() => total === 5)
  // this counts as part of the stack
  .do(() => console.log(total))
```

**`.do(exec)`**

This method is useful when you need to execute something after a
convergence in the stack, but before other convergences are ran.
This can help with debugging in between convergences and also
allows you to run side effects between convergences.

``` javascript
converge
  .when(() => total === 5)
  // executes after the total is equal to 5
  .do(() => total *= 100)
  // starts converging after the total has been multiplied
  .always(() => total === 500)
```

Functions in a `Convergence` stack curry their return value
between other functions in the stack. This means that what you return
from one function in the stack will be available as the argument
given to the next function in the stack.

``` javascript
converge
  // returns the element when it exists in the DOM
  .when(() => {
    let $el = $('[data-test-element]');
    expect($el).to.exist;
    return $el;
  })
  // clicks the element and returns it for chaining
  .do(($el) => {
    $el.get(0).click();
    return $el;
  })
  // converges when the element is disabled for the remaining timeout
  .always(($el) => {
    expect($el).to.have.prop('disabled', true)
  })
```

You can even return promises, or other convergences from this method.

``` javascript
converge
  .do(() => Promise.resolve(5))
  .do((total) => new Convergence()
    // the final always will still get the remaining time
    .always(() => total === 5 && total))
  // ... unless it is followed by additional methods
  .do((total) => total *= 100)
```


**`.append()`**

Combines convergences to allow composing them together to create brand
new convergence instances.

``` javascript
let converge1 = converge.when(() => total === 1)
let converge5 = converge.when(() => total === 5)

// converges when the total first equals `1` and then equals `5`
converge1.append(converge5)
```

**`.run()`**

In order to actually run a `Convergence` instance, you must call the
`.run()` method. This method **does not return another instance**,
instead it returns a promise that resolves when all assertions in the
stack have converged. The returned promise will keep track of the
current timeout and ensure that all convergences in the stack converge
within that period.

Because `.run()` returns a promise, and `Convergence` is immutable,
you can call `.run()` multiple times on the same convergence instance.

``` javascript
converge.run()
  .catch(() => {
    console.log('failed. trying again...');
    return converge.run();
  })
  .then(() => {
    console.log('success!')
  });
```

The promise returned from `.run()` resolves with a stats object. This
stats object holds various information about how the convergences in
the stack ran. The `stack` property is an array of stats objects
specific to each function in the stack.

``` javascript
converge.run((stats) => {
  stats.start    // start time of the convergences
  stats.end      // end time of the convergences
  stats.elapsed  // time taken to converge on the entire stack
  stats.runs     // number of times functions in the stack ran
  stats.timeout  // this Convergence instance's timeout
  stats.value    // value returned from the last function in the stack
  stats.stack    // an array of stats objects from the stack

  // each function in the stack produces similar stats objects
  stats.stack[0].start    // start time of this convergence
  stats.stack[0].end      // end time of this convergence
  stats.stack[0].elapsed  // time taken for this convergence
  stats.stack[0].runs     // number of times this convergence ran
  stats.stack[0].timeout  // the timeout this convergence was given
  stats.stack[0].always   // whether this convergence used .always()
  stats.stack[0].value    // value returned from this convergence
});
```

_Note: functions added using `.do()` produce a small stats object as
well, but they omit `runs`, `timeout`, and `always` since they do not
apply to these functions._

## Advanced

### `convergeOn`

This is a low-level API used by `Convergence` and you probably don't
need it. If you think you do, get in touch. If you'd just like to know
how it works, check out [the source](https://github.com/thefrontside/bigtest/blob/master/packages/convergence/src/converge-on.js).
