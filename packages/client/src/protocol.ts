export interface Message {
  query?: string;
  mutation?: string;
  subscription?: string;
  responseId?: string;
}

export interface Response {
  done?: boolean;
  data?: unknown;
  errors?: Array<{ message: string }>;
  responseId?: string;
}

export interface QueryMessage extends Message {
  query: string;
  live?: boolean;
}

export interface SubscriptionMessage extends Message {
  subscription: string;
}

export interface MutationMessage extends Message {
  mutation: string;
}

export interface DataResponse extends Response {
  data: unknown;
}

export interface DoneResponse extends Response {
  done: true;
}

export interface ErrorResponse extends Response {
  errors: Array<{ message: string }>;
}

export function isQuery(message: Message): message is QueryMessage {
  return !!message['query'];
}

export function isSubscription(message: Message): message is SubscriptionMessage {
  return !!message['subscription'];
}

export function isMutation(message: Message): message is MutationMessage {
  return !!message['mutation'];
}

export function isDataResponse(message: Response): message is DataResponse {
  return !!message['data'];
}

export function isDoneResponse(message: Response): message is DoneResponse {
  return !!message['done'];
}

export function isErrorResponse(message: Response): message is ErrorResponse {
  return !!message['errors'];
}
