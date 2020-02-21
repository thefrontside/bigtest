export interface Message {
  responseId?: string;
}

export interface QueryMessage extends Message {
  query: string;
  live?: boolean;
}

export interface MutationMessage extends Message {
  mutation: string;
}

export interface DataResponse extends Message {
  data: unknown;
}

export interface ErrorResponse extends Message {
  errors: Array<{ message: string }>;
}

export function isQuery(message: Message): message is QueryMessage {
  return !!message['query'];
}

export function isMutation(message: Message): message is MutationMessage {
  return !!message['mutation'];
}

export function isDataResponse(message: Message): message is DataResponse {
  return !!message['data'];
}

export function isErrorResponse(message: Message): message is ErrorResponse {
  return !!message['errors'];
}
