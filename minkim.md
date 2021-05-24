# agent
- `src/server-config.ts`
  - added agentDir to specify local agent app directory for DX
  - passing in `verBigTest` into agentUrl method inside `AgentServerConfig`
    # where is it being consumed?
      <!-- 
        the agenturl method is being used for the createbrowsermanager() function inside the server's orchestrator 
      -->
    ```js
    agentUrl(connectionUrl: string, agentId?: string, verBigTest?: string): string {
      let url = new URL(this.url());
      url.pathname = url.pathname + 'index.html';
      url.searchParams.append('connectTo', connectionUrl);
      if (agentId) {
        url.searchParams.append('agentId', agentId);
      }
      if (verBigTest) {
        url.searchParams.append('ver', verBigTest);
      }
      return url.toString();
    }
    ```
      <!-- 
        this method returns the url which then the server launches the browser to connect to. and the if statement i added is saying if there is a bigtest version being passed into the method, then add it to the params = bigtestver ? .com&ver=123 : .com 
      -->

# project
- `src/index.ts`
  - specify `agentDir` arg

# server
- `src/orchestrator.ts`
  - added `agentURL` version argument to `connectURL` arg of `browserManager`
  ```js
    connectURL: (agentId: string) => agentServerConfig.agentUrl(connectTo, agentId, version),
  ```
    - version is hardcoded so it goes four directories up from where bigtest server is being invoked which should take the user to the node_modules of their project and then into the bigtest directory to get the package.json
      - ask if this is okay
        - alternative would be to somehow pass down the package version from `bigtest` into `bigtest/cli` but it's only a dependency and isn't connected any other way except that you just install `bigtest` and get access to the npx commands?
      - this means the tests need to be re-written because they are failing
    - the version is being passed into `agentServerConfig.agentUrl`



So at the moment the agent of this PR looks like this:
```html
<html>
  <head>...</head>
  <body>
    <AgentToolBar/>
    <div id="body">
      <splashimage/>
      <iframe id="test-frame">
        #document
          <html>
            <head>...</head>
            <body>
              <iframe id="app-frame">
                #document
                  <SampleApp/>
              </iframe>
              <script src="test-frame-main.ts"></script>
            </body>
          </html>
      </iframe>
      <script src="./main.ts"></script>
    </div>
  </body>
</html>
```

I would like to subscribe to `document.querySelector('iframe[id=test-frame]').contentDocument.querySelector('iframe[id=app-frame]').contentWindow.location.href` from within `<AgentToolBar/>` but I'm not sure how I should go about it.

I first fiddled with `useEffect()` and its second argument but that was no use because we're trying to observe elements outside its component. Then I messed around with `MutationObserver` in hopes of maybe detecting for DOM changes in the individual iframe so that it knows how and when to re-evaluate the `location.href` but that I wasn't able to get too far with that approach.


# 415
When things don't work quite as expected in CI mode, you want to leave the whole things running so that you can inspect the browser developer console and environment. However, when bigtest exits it shuts down everything very efficiently, so it can be difficult to understand what exactly happens.

I propose adding a `--no-exit` flag to just leave everything on after a CI run.

# 625
When debugging, it's useful to be able to stop at a specific step to see what's happening on the screen. I've been using

```js
.step('stop here', () => new Promise(() => {}))
```

What about a `debug()` action that pauses in the debugger. The only problem with the pause is that your timeout is still running.

## UX
`yarn bigtest ci --no-exit` halts timeout at the end and doesn't shut down
  - once we hit the end of tests, display in console `In no exit mode. Press q to quit.`
`.debug()` step halts timeout and doesn't resume: `Entered debug mode. Press any key to resume.`

In both situations we need to pause the timeout and listen for user response.
  - look at init for user input
  - look at args passed into run test to track down how timeout is implemented

## timeout pausing PR
sample app depends on `file:../../packages/bigtest`
sample app scripts:
```json
{
"server-build": "yarn --cwd ../ workspace @bigtest/server prepack",
"cli-update": "yarn --cwd ../ workspace @bigtest/cli install --force && yarn --cwd ../ workspace @bigtest/cli prepack",
"bigtest-update": "yarn --cwd ../ workspace bigtest install --force && yarn --cwd ../ workspace bigtest prepack",
"installf": "yarn --cwd app install --force",
"server": "yarn --cwd app bigtest server",
"test": "yarn --cwd app bigtest test",
"update-server": "yarn server-build && yarn cli-update && yarn bigtest-update && yarn installf && yarn server"
}
```
bigtest/cli depends on `file:../server`
bigtest depends on `file:../cli`

## todo list
- [ ] get run-lane to be able to output, i think by wrapping whatever calls it with a subscribe probably
<!-- - [ ] insert a console log into run-lane so that it triggers before each step/assertion
  - [ ] add more tests to bigtest sample app for more variety -->
- [ ] access timeout from lane by console logging the value
- [ ] button from toolbar to access information from run-lane
- [ ] decide which is better...
  ```js
  test => test .step().pause()
  // vs
  test => test .step().step(pause())
  ```
  - downside to .step(pause()) is pause will need to be imported
