# @bigtest/server

To run the server:

``` sh
$ yarn start
```

Then open the following URL in a browser:

<http://localhost:24004/index.html?orchestrator=ws%3A%2F%2Flocalhost%3A24003>


To run the tests:

``` sh
$ yarn test
```

### Connecting to a development agent server

In production, bigtest will start its own agent application server,
but when actually developing on bigtest, you may want to hack on
the browser agent code itself. To do this, you can start the agent
application server in a separate process and then pass that url into
the orchestrator process via the `BIGTEST_AGENT_SERVER_URL`

For example:

``` shell
$ BIGTEST_AGENT_SERVER_URL=http://localhost:5555 yarn start
```

The development orchestrator will now use the external agent
application server instead of starting its own.
