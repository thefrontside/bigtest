import { Client, createClient } from '@bigtest/client';
import { useOperation } from './use-operation';
import { useState } from 'react';

const stateQuery = `
query {
  agents {
    agentId
    os {
      name
      version
      versionName
    }
    platform {
      type
      vendor
    }
    browser {
      name
      version
    }
  }
}`

export interface OrchestratorState {
  agents: {
    agentId: string;
    os: {
      name: string;
      version: string;
      versionName: string;
    };
    platform: {
      type: string;
      vendor: string;
    };
    browser: {
      name: string;
      version: string;
    }
  }[]
}

export function useOrchestratorState(url: URL): OrchestratorState  {
  let [state, setState] = useState<OrchestratorState>({
    agents: []
  });

  useOperation(function*() {
    let wss = new URL(url.toString());
    wss.protocol = 'ws';

    let client: Client = yield createClient(wss.toString());
    yield client.liveQuery<OrchestratorState>(stateQuery).forEach(result => {
      setState(result);
    })
  }, [url]);
  return state;
}
