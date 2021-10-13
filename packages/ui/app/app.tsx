import 'graphiql/graphiql.css';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import React, { ReactElement } from 'react';

export interface AppProps {
  server: () => URL;
}

export function App({ server }: AppProps): ReactElement {
  let url = server();
  return <GraphiQL fetcher={createGraphiQLFetcher({
    url: `${url}`,
  })}/>;
}
