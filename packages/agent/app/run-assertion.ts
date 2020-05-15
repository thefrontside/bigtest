import { Operation, timeout } from 'effection';
import { ErrorDetails, Context as TestContext, Assertion } from '@bigtest/suite';
import { Maybe, Just, Nothing, isJust } from './maybe';

export function* runAssertion(assertion: Assertion, context: TestContext, timelimit: number): Operation<Maybe<ErrorDetails>> {
  let error: Maybe<ErrorDetails> = Nothing;
  for (let start = Date.now(); Date.now() - start < timelimit;) {
    error  = yield checkAssertion(assertion, context);
    if (isJust(error)) {
      yield timeout(5);
    } else {
      break;
    }
  }
  return error;
}

function* checkAssertion(assertion: Assertion, context: TestContext): Operation<Maybe<ErrorDetails>> {
  try {
    assertion.check(context);
    return Nothing;
  } catch (error) {
    return Just(error);
  }
}
