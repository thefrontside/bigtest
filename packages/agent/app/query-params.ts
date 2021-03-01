export interface QueryParams {
  connectTo: string;
  agentId?: string;
  version?: string;
}

function parseQueryParams(): QueryParams {
  let url = new URL(location.href);
  let connectTo = url.searchParams.get('connectTo');

  if (!connectTo) {
    throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
  }

  return {
    connectTo,
    agentId: url.searchParams.get('agentId') || undefined,
    // version: url.searchParams.get('ver') || undefined
  }
}

export const queryParams = parseQueryParams();
