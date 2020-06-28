# Never write a flaky test again!

For the past few months, Frontside has been working on BigTest, a new and
revolutionary testing framework. Testing the frontend of complex applications
is often associated with nightmarishly inconsistent test suites, where
seemingly randomly occurring failures cast doubt on the value of the tests
themselves and frustrate developers to no end.

Our mission with BigTest has been to eliminate flakiness in tests altogether
and provide the most stable, most easy to use, and best performing test
framework out there. We'll be ready to share more about BigTest soon, but for
the moment I would like to talk about the approach we've taken to eliminate
flakiness, and also what you need to know to write tests which are solid as a
rock and never fail randomly.

The approach we have taken is not novel. I am the original author of
Capybara, an acceptance test framework written in Ruby, which has a
reputation of being incredibly solid and resistant to flakiness. We have
taken all of the lessons learned from tweaking Capybara over years and
applied them to build the Interactor API, a powerful way of defining
interactions with your application which allows you to write tests which are
even more solid than what Capybara can provide.

However, eliminating flakiness in the framework is only part of the solution,
sometimes the issue is not with the framework, but with how we write our
tests, and inherent ambiguities in the way we write them. Eliminating these
ambiguities is what allows you to write very stable tests.

Let's take a deep dive into our strategy for avoiding flakiness.

## Let's wait!

The approach we've taken is simple: for any interaction we want to perform,
or any assertion we want to check, we will try it and see if it succeeds, if
it does not, we will wait a little while and try again. We will keep doing
this until we either succeed, or some set amount of time has expired and we
give up and fail.

This surprisingly simple strategy is enough to eliminate flakiness, provided
that the timeout is sufficienlty long, but there are of course a whole number
of details that need to be done right for this to work as intended.

We are calling this strategy "convergence", and a function which exhibts this
waiting behaviour is called "convergent".

### Retaining references

The most important detail is that an interaction or assertion must fully
capture all of the work that it needs to perform, and perform all of the work
again and again in the retry loop. Quite simply we can never use any outdated
references to elements, we must always run everything against the actual DOM.

For example, let's imagine we have a field for an name and this is within a
form. We would like to set the value of this field, with BigTest interactors
this could look like this:

``` javascript
await Form.byId('login').find(TextField.byId('name')).fillIn('Jonas');
```

We can think of this as roughly performing three steps under the hood:

``` javascript
let form = document.querySelector('#login'); // step 1
let textField = form.querySelector('#name'); // step 2
textField.value = 'Jonas' // step 3
```

Just re-running step 3 again and again is not enough. The form element could
change, the text field could change, and either of those things would cause
us to retry something which will never work. In order to make this as stable
as possible we need to re-run all of the steps, every time.

A very simplified algorithm for how this could work looks roughly like this:

``` javascript
while(true) {
  let startTime = new Date();
  try {
    // Run our actual interaction code
    let form = document.querySelector('#login'); // step 1
    let textField = form.querySelector('#name'); // step 2
    textField.value = 'Jonas' // step 3
    // if it fully succeeds, break out of the loop
    break;
  } catch(e) {
    // if there was an error, check if we've already been trying for too long
    if((new Date() - startTime) > MAX_WAIT_TIME) {
      throw e;
    } else {
      // wait a little while
      await sleep(1);
    }
  }
}
```

Of course, our interactors perform this transformation automatically, and you
can just use our easy to use API and rest assured that we have automatically
tranformed this into the above form for you! Just write it like this:

``` javascript
await Form.byId('login').find(TextField.byId('name')).fillIn('Jonas');
```

There are of course a number of details that are omitted in the simplified
code above. For example, each interactor must be specific enough to match a
*single* element on the page. This means that if there were multiple fields
with the id `name` then the above interaction would fail. This forces you to
be specific enough so that you don't end up interacting with a random element
on the page, and your tests might break due to layout changes where the order
of elements changes.

### Taming the event loop

One huge advantage that we have over Capybara is that since we are running tests
directly in the browser, we can leverage the event loop, and ensure that our
interactions run fully within the same tick of the loop. This eliminates a lot
of problems which plague Capybara and similar frameworks based on Selenium and
similar tools. In Capybara we go to great lengths to avoid problems with the
dreaded `StaleReferenceError`, but we simply do not need to do this in BigTest.
By running within the event loop, and ensuring that we never release it, we can
ensure that our elements are never stale.

This has some implications on the way that interactors are defined, but we
have worked very hard to make it as intuitive as possible to write
interactors in such a way that they will be very resistant to problems on
this front. Of course, BigTest will also ship with a rich library of
interactors already built in, for all of the most common interface elements
in web applications, so most users never have to define their own interactors
if they don't want to.

The TextField interactor we used above could be defined like this:

``` typescript
const TextField = createInteractor<HTMLInputElement>('text field')({
  selector: 'input',
  locators: {
    byId: (element) => element.id,
  },
  actions: {
    fillIn: (element, value: string) => { element.value = value }
  }
});
```

Both the locator and action functions are synchronous functions, which means
that they do not release the event loop. This allows us to transform them
into convergent functions on the interactor which perform the entire
interaction of finding the element and runnign the functions against them.

BigTest is written in TypeScript and our interactors are fully typesafe when
used from TypeScript both in their definition and when using them.

## Inherent ambiguities

We have claimed that our convergence strategy is enough to eliminate
flakiness, but as we mentioned as well, having a solid strategy is only part
of the solution, the other half of the solution is writing the tests in such
a way that they make maximal usage of this solution and avoid inherent
ambiguities that we cannot otherwise resolve.

Let's illustrate what we mean by this with an example: Imagine we have a paginated
list with a 'Next' link at the bottom. Whenever we press the next link we will load
a new set of rows, we will also update the `href` attribute of the next link to point
to the next page.

[GRAPHIC]

Now imagine a written a test written like this:

``` typescript
await Link('Next').click();
await Link('Next').click();
```

Which page will we end up on? Intuitively we would say that we should end up
on the *third* page, but unfortunately the actual answer is "it depends". The
first click on `Next` will start a request to the server which will complete
after some time, this will change the `href` of the link. But if our second
click happens *before* the request completes, we will navigate to the second
page *twice*, and we actually end up on the *second* page.

[GRAPHIC]

### Guessing

A common way to work around this issue is to try and guess when an
interaction is "done", for example, by checking if there are any active
requests to the server, and waiting for those to complete.

This was the original strategy used in Capybara, but we realized that this
strategy has a fatal flaw and moved away from it.

Let's imagine that the event loop is released between the request completing
and the DOM being updated. Our second click could now occur in this small
window of time between the request completing and the DOM being updated. What
we have done is made the window of time for flakiness to occur smaller, but
we have not eliminated it! This still might seem like a win on the surface,
but in fact, making the window smaller is actually
*worse*, because it means that the issue will occur more rarely, and
therefore will be harder to track down and fix.

### Anchoring

A better solution would be to "anchor" the second interaction, by adding an assertion
which ensures we have transitioned to the second page beforehand:

``` typescript
await Link('Next').click();
await ListItem('This item is on the second page').exists();
await Link('Next').click();
```

We can now be sure that we have transitioned to the second page. It is unlikely
that the modifications to the DOM of rendering the second page and updating the
link will occurr in separate ticks of the event loop, so most likely this will
be enought to eliminate the race condition.

### Fixing the UI

But there's an even better solution. The problem here stems from the fact
that the UI itself is ambiguous. If the user of the application did hit the
'Next' link twice in rapid succession, what would happen? The result is
equally undefined as the result of the test is.

If we fix the UI to disable the 'Next' link while the request for the second
page is loading, we don't need to change our test at all. When the request
completes and updates the `href`, it will also enable the link again, and
since we will keep retrying to find and click the link, we will then see the
newly enabled link and click it.

By making our UI less ambigous we have also made our tests more stable. We have
effectively discovered a flaw in our UI and fixed it, made our application better
and fixed our test in the process.

Of course we don't always have control over our application or the ability to make
this type of tweak. In those cases, "anchoring" as described above is a good alternative.

## Conclusion

I have personally worked on Capybara itself, and written many test suites
which use it. By being conscious of the requirements which need to be met to
write stable tests, I've written test suites for very large, very complex
applications which were 100% stable and never experienced any flakiness. I've
taken test suites which were previously flaky, and by applying these
strategies, I've been able to eliminate any flakiness.

I do not believe that any other strategy for writing acceptance style tests
can claim this track record.

This is why we have chosen this strategy for BigTest, why we've designed
everything with this strategy in mind from the beginning, to make it as easy
as possible to write stable tests, and why we are committed to providing even
more explanational and educational material to help you write tests which are
as stable as possible and therefore as useful as possible to you.

We will be releasing even more information about BigTest soon, but we hope
you enjoy this sneak preview. Follow us on ??? for the latest updates about
BigTest.