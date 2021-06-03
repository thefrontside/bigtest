# files todos
packages/agent/
  - [ ] readme.md
  app/
  - [x] agent.ts
    - just needed to add an interface type
  - [ ] clear-persistent-storage.ts
    `fork`, `Operation` from effection
  - [x] harness.ts
    - swap main() for run()
    - on.map() doesn't take an array anymore
    - gave yield function a type of `Operation<void>`
  - [ ] lane-config.ts
    `Channel` from channel
  - [x] main.ts
    - swap main() for run()
  - [ ] manifest.ts
    `Operation` from effection
    `once` from events
  - [ ] run-lane.ts
    `Operation`, `fork`, `spawn` from effection
    `on` from events
  - [ ] runner.ts
    `Operation` from effection
    `Channel` from channel
    `once` from events
    `subscribe` from subscription
  - [ ] serialize-error.ts
    `Operation`, `spawn`, `join` from 'effection
  - [x] test-frame.main.ts
    - swap main() for run()
  - [ ] timebox.ts
    `operation`, `spawn`, `timeout` from effection
    - kept timeout instead of using sleep because we need it to throw an error if it reaches its limit; the new timeout throws the error so i removed the throw logic inside timebox.ts
  shared/
  - [ ] agent.ts
      `operation`, `resource`, `spawn` from effection
      `on`, `once` from events
      `chainableSubscribbale`, `createSubscription` from subscription
  - [ ] protocol.ts
      `operation` from effection
  src/
  - [ ] agent-handler.ts
      `channel` from effection/channel
      `createSubscription`, `subscribe`, `ChainableSubscription` from subscription
      `operation`, `spawn` from effection
  test/
  - [ ] agent-test.ts
      `ChainableSubscription`, `subscribe` from subscription
  - [ ] helper.ts
      `Context`, `Operation`, `run` from effection

# imports listed
`effection`
  context
  fork
  join
  <!-- main -->
  Operation
  run
  resource
  spawn
  <!-- timeout -->
`@effection/channel` // exported from effection in v2
  channel
`@effection/events` // exported from effection in v2
  on
  once
`@effection/subscription` // exported from effection in v2
  chainableSubscribbale
  createSubscription
  subscribe

# cheat cheat
`operation` must return a yield function:
  function whateverIwant() {
    return function*() {
      do stuff
    }
  }

`subscribe` is no longer necessary
  instead of
    function* what() {
      let { stdout } = yield whatever();
      yield spawn(subscribe(stdout).forEach...)
    }

  do
    function* what(task) {
      let { stdout } = whatever.run(task);
      task.spawn(stdout);
    }

`on()`
  - `on.map()` doesn't take an argument of array anymore
  - used to return `createSubscription()` with an argument type of `Subscriber` which then returns `ChainableSubscribable`
    - but this has been renamed to `createStream()` with `Callback` argument which returns `Stream`
      - `ChainableSubscribable` and `Stream` seem to be identical-ish
