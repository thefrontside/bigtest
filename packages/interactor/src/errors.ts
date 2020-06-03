export class NoSuchElementError extends Error {
  get name() { return "NoSuchElementError" }
}

export class AmbigousElementError extends Error {
  get name() { return "AmbigousElementError" }
}

export class NotAbsentError extends Error {
  get name() { return "NotAbsentError" }
}

export class ActionsDisabledError extends Error {
  constructor(reason: string | boolean) {
    let message = 'Actions are disabled';
    if(typeof(reason) === 'string') {
      message += `: ${reason}`;
    }
    super(message);
  }

  get name() { return "ActionsDisabledError" }
}
