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