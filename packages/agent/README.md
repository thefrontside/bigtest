# @bigtest/agent

Agent for connecting test environments (browsers) to BigTest

## Synopsis

Bigtest agents are applications that run _in process_ with the system
under test that accept commands on behalf of, and report results back
to, the bigtest server.

This package contains an agent for web browsers, and also a web
application to serve it to browsers.

To start an agent server in process, you can use the
`AgentServer.create()` operation, passing it the websocket url where
the bigtest server will be accepting connections from agents.

``` typescript
import { main } from 'effection';
import { AgentServer } from '@bigtest/agent';

main(function* run() {
  let agentServer: AgentServer = yield AgentServer.create('ws://localhost:5000');
  console.log('connect browsers to ${agent.agentAppURL}');
});
```

By default, the agent will connect to a random available port and
serve the agent app from `agent.agentAppURL`;


### Writing your own agents

The AgentServer class serves the web agent which is the agent that
adapts browsers to bigtest, but you can write your own agents that can
adapt _any_ runtime that supports websockets to be a testbed for
BigTest. You can do this with the `Agent` class.

``` typescript
import { main } from '@effection';
import { Agent, Command } from '@bigtest/agent';

main(funtion*() {

  let socket = WebSocket('http://localhost:1234');
  let agent = yield Agent.start(socket);

  // let the orchestrator know that you're here!
  agent.send({
    type: 'connected',
    data: 'secret agent'
  });

  // await for commands from the orchestrator
  while (true) {
    let command: Command = yield agent.receive();

    // the orchestrator wants us to do something. let's do it!
    yield handleCommand(command);
  }
});
```

## Development

Normally, the server will start an agent for you, but in order to
develop the agent code, you'll want to start a development agent at a
given port, and then point your bigtest server at it at the known
location. To do this, run the `start` command. This will start a
parcel server to continually watch and build the application as you
develop. Any arguments will be passed on to parcel.

``` shell
$ yarn start --port 5000
Server running at http://localhost:5000
✨  Built in 463ms.
```

You can now, in your server code, instantiate the AgentServer with the
`AgentServer.external()` method:

``` typescript
let server: AgentServer = yield AgentServer.external('http://localhost:5500', 'ws://localhost:5000');
console.log('connect browsers to ${agent.agentAppURL}');
```

Now, the agent url will connect to the development agent.

To run the tests:

``` sh
$ yarn test
```

The tests use a faked manifest, which is editable in
`test/fixtures/manifest.src.js`.  If you make any changes to this file, you
must rebuild the compiled manifest like this:

``` sh
$ yarn manifest:build
```
