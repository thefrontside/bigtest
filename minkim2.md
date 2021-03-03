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

pause, play, step