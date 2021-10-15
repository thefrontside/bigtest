import 'graphiql/graphiql.css';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import React, { ReactElement} from 'react';

import { useOrchestratorState } from './use-orchestrator-state';

export interface AppProps {
    server: () => URL;
}

export function App({ server }: AppProps): ReactElement {
    let url = server();

    let state = useOrchestratorState(url);


    return <div>
        <ol>
            {state.agents.map(agent => <li>{agent.agentId}</li>)}
        </ol>
        <GraphiQL fetcher={createGraphiQLFetcher({ url: `${url}` })}/>
    </div>
}
