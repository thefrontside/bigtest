import { TestImplementation, Context, Step, Assertion } from './interfaces';

/**
 * This provides a builder API to construct BigTest tests. The builder API
 * makes it more consise to write tests, as well as providing type safety if
 * you're using TypeScript.
 *
 * @param description The description to apply to the test, a human readable text which describes the test's purpose.
 * @typeParam C test steps and assertions receive a context as an argument, and can extend this context through their return values, the context usually starts out empty.
 */
export function test<C extends Context = Record<string, unknown>>(description: string): TestBuilder<C> {
  return new TestBuilder<C>({
    description,
    steps: [],
    assertions: [],
    children: []
  });
}

export type Action<C extends Context, R extends Context | void> = (context: C) => Promise<R> | R;
export type Check<C extends Context> = (context: C) => Promise<void> | void;

export interface StepDefinition<C extends Context, R extends Context | void> {
  description: string;
  action: Action<C,R>;
}
type StepList<C extends Context> = [StepDefinition<C,void>, ...StepDefinition<C,void>[]];

export interface AssertionDefinition<C extends Context> {
  description: string;
  check: Check<C>;
}

type AssertionList<C extends Context> = [AssertionDefinition<C>, ...AssertionDefinition<C>[]];

class TestStructureError extends Error {
  name = 'TestStructureError'

  constructor(message: string) {
    super(message + '\n\nBigTest tests separate assertions and steps, where assertions should not affect application state and only verify behaviour. Assertions and children are always run after steps, so you cannot add them out of order.');
  }
}

type TestBuilderState = 'step' | 'assertion' | 'child';

/**
 * A builder API for constructing BigTest tests. This is usually created via the {@link test} function.
 *
 * @typeParam C test steps and assertions receive a context as an argument, and can extend this context through their return values.
 */
export class TestBuilder<C extends Context> implements TestImplementation {
  /** @hidden */
  public description: string;
  /** @hidden */
  public steps: Step[];
  /** @hidden */
  public assertions: Assertion[];
  /** @hidden */
  public children: TestImplementation[];

  /** @hidden */
  private state: TestBuilderState;

  /** @hidden */
  constructor(test: TestImplementation, state: TestBuilderState = 'step') {
    this.description = test.description;
    this.steps = test.steps;
    this.assertions = test.assertions;
    this.children = test.children;
    this.state = state;
  }

  /**
   * Add one or more steps to this test. The arguments to this function should
   * be either a description and an action, or one or more objects which have
   * `description` and `action` properties. Interactor actions and assertions
   * can both be used as a step directly.
   *
   * The action is an async function which can return either void or an object.
   * If it returns an object, then this object is merged into the context,
   *
   * ### With description and action
   *
   * ``` typescript
   * .step("click the new post link", async () {
   *   await Link('New post').click();
   * });
   * ```
   *
   * ### With step objects
   *
   * ``` typescript
   * .step(
   *   {
   *     description: "click the new post link",
   *     action: async () {
   *       await Link('New post').click();
   *     }
   *   },
   *   {
   *     description: "fill in the text",
   *     action: async () {
   *       await TextField('Title').fillIn('An introduction to BigTest');
   *     }
   *   }
   * );
   * ```
   *
   * ### With interactor
   *
   * Interactor actions and assertions implement the step object interface, so
   * they can be used like this:
   *
   * ``` typescript
   * .step(Link('New post').click())
   * .step(TextField('Title').fillIn('An introduction to BigTest'))
   * ```
   *
   * Or like this if you prefer:
   *
   * ``` typescript
   * .step(
   *   Link('New post').click(),
   *   TextField('Title').fillIn('An introduction to BigTest'),
   * )
   * ```
   *
   * ### Returning from context
   *
   * Returning an object from a step merges it into the context, and it can
   * then be used in subsequent steps.
   *
   * ``` typescript
   * .step("given a user", async () {
   *   return { user: await User.create() }
   * })
   * .step("and the user has a post", async ({ user }) {
   *   return { post: await Post.create({ user }) }
   * })
   * .step("when I visit the post", async ({ user, post }) {
   *   await Page.visit(`/users/${user.id}/posts/${post.id}`);
   * })
   * ```
   *
   * @param description The description of this step
   * @param action An async function which receives the current context and may return an object which extends the context. See {@link Action}.
   * @typeParam R The return type of the action function can optionally be an object which will be merged into the context.
   */
  step<R extends Context | void>(description: string, action: Action<C,R>): TestBuilder<R extends void ? C : C & R>;
  /**
   * @param steps A list of step objects, each of which must have a `description` and `action` property.
   */
  step(...steps: StepList<C>): TestBuilder<C>;
  step<R extends Context | void>(...args: [string, Action<C,R>] | StepList<C>): TestBuilder<R extends void ? C : C & R> {
    if(this.state === 'assertion' || this.state === 'child') {
      throw new TestStructureError(`Cannot add step after adding ${this.state}`);
    }

    function getSteps(): Step[] {
      let [first, second] = args;
      if (typeof first === 'string') {
        return [{
          description: first,
          action: second ? second : async () => undefined
        }] as Step[];
      } else {
        return args as Step[];
      }
    }

    return new TestBuilder({
      ...this,
      steps: this.steps.concat(getSteps()),
    });
  }

  /**
   * Add one or more assertions to this test. The arguments to this function
   * should be either a description and a check, or one or more objects which
   * have `description` and `check` properties. Interactor assertions can be
   * used as an assertion directly, but interactor actions cannot.
   *
   * The check is an async function, if it completes without error, the
   * assertion passes. Its return value is ignored.
   *
   * ### With description and check
   *
   * ``` typescript
   * .assertion("the new post link is no longer shown", async () {
   *   await Link('New post').absent();
   * });
   * ```
   *
   * ### With assertion objects
   *
   * ``` typescript
   * .step(
   *   {
   *     description: "the new post link is no longer shown",
   *     check: async () {
   *       await Link('New post').absent();
   *     }
   *   },
   *   {
   *     description: "the heading has changed",
   *     check: async () {
   *       await Heading('Create a new post').exists();
   *     }
   *   }
   * );
   * ```
   *
   * ### With interactor
   *
   * Interactor assertions implement the assertion object interface, so they
   * can be used like this:
   *
   * ``` typescript
   * .assertion(Link('New post').absent())
   * .assertion(Headline('Create a new post').exists())
   * ```
   *
   * Or like this if you prefer:
   *
   * ``` typescript
   * .assertion(
   *   Link('New post').absent(),
   *   Headline('Create a new post').exists()
   * )
   * ```
   *
   * @param description The description of this assertion
   * @param check An async function which receives the context. See {@link Check}.
   */
  assertion(description: string, check: Check<C>): TestBuilder<C>;
  /**
   * @param steps A list of assertion objects, each of which must have a `description` and `check` property.
   */
  assertion(...assertions: AssertionList<C>): TestBuilder<C>;
  assertion(...args: [string, Check<C>] | AssertionList<C>): TestBuilder<C> {
    if(this.state === 'child') {
      throw new TestStructureError(`Cannot add step after adding ${this.state}`);
    }

    function getAssertions(): Assertion[] {
      let [first, second] = args;
      if (typeof first === 'string') {
        return [{
          description: first,
          check: second ? second : async () => undefined
        }] as Assertion[];
      } else {
        return args as Assertion[];
      }
    }

    return new TestBuilder({
      ...this,
      assertions: this.assertions.concat(getAssertions()),
    }, 'assertion');
  }

  /**
   * Add a child test to this test. Child tests are executed after all of a
   * tests steps have run. Each child test may in turn add steps and
   * assertions.
   *
   * A callback function must be provided as the second argument. This function
   * receives a {@link TestBuilder} which you can use to construct the child
   * test.  The finished child test is then returned from the callback
   * function.
   *
   * ### Example
   *
   * ``` typescript
   * .child("signing in", (test) => {
   *   return (
   *     test
   *       .step(TextField('Email').fillIn('jonas@example.com'))
   *       .step(TextField('Password').fillIn('password123'))
   *       .step(Button('Submit').click()
   *   )
   * });
   * ```
   *
   * Or more consisely:
   *
   * ``` typescript
   * .child("signing in", (test) => test
   *   .step(TextField('Email').fillIn('jonas@example.com'))
   *   .step(TextField('Password').fillIn('password123'))
   *   .step(Button('Submit').click()
   * );
   * ```
   *
   * *Note: the odd signature using a callback function was chosen because it
   * improves type checking and inference when using TypeScript.*
   *
   * @param description The description of this child test
   * @param childFn a callback function
   */
  child(description: string, childFn: (inner: TestBuilder<C>) => TestBuilder<Context>): TestBuilder<C> {
    let child = childFn(test(description));
    return new TestBuilder({
      ...this,
      children: this.children.concat(child)
    }, 'child');
  }
}
