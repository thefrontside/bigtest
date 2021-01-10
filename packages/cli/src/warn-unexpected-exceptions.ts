import { Operation } from 'effection';
import terminalLink from 'terminal-link';

export function warnUnexpectedExceptions<T>(operation: (argv: string[]) => Operation<T>): (argv: string[]) => Operation<T> {
  return function*(argv: string[]) {
    try {
      return yield operation(argv);
    } catch (error) {
      if (error.name !== 'EffectionMainError') {
        console.warn(unexpectedErrorMessage(error, argv));
      }
      throw error;
    }
  }
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const unexpectedErrorMessage = (error: any, argv: string[]) =>
  `😱😱😱 OH NO! UNEXPECTED ERROR! 😱😱😱
It looks like you've encountered a bug in BigTest that triggered an unexpected
shutdown. And yes, in case you're wondering, this is definitely on us. It would
help us a lot to improve BigTest if you'd take the time to report the problem.

${terminalLink.stderr('Submit an issue to the BigTest repository', newIssueLink(error, argv))}
`

//eslint-disable-next-line @typescript-eslint/no-explicit-any
function newIssueLink(error: any, argv: string[]) {
  let message = error && error.message != null ? error.message : 'unknown error';
  let title = `CRASH: ${message}`;
  let labels = `🐛bug,@bigtest/cli`;
  let body = getIssueBody(error, argv);
  return uriEncode`https://github.com/thefrontside/bigtest/issues/new?title=${title}&labels=${labels}&body=${body}`;
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIssueBody = (error: any, argv: string[]) =>
`
# Error Report

> Please fill in your error report here with any details you think may be relevant to why
> the crash happened. Make sure to double check the diagnostic information to make sure that
> it doesn't contain anything that shouldn't be public.

<details><summary>diagnostics</summary>

Argv
----
${argv.join(',')}

Stack
-----
${error && error.stack ? error.stack : 'none'}

</details>
`

function uriEncode(strings: TemplateStringsArray, ...values: string[]) {
  let encoded = values.map(encodeURIComponent);
  return strings.map((str, idx) => idx < values.length ? `${str}${encoded[idx]}` : str).join('');
}
