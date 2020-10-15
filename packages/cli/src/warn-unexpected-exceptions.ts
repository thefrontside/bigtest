import { Operation } from 'effection';

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

const unexpectedErrorMessage = (error: any, argv: string[]) =>
  `😱😱😱 OH NO! UNEXPECTED ERROR! 😱😱😱
It looks like you've encountered a bug in BigTest that triggered an unexpected
shutdown. And yes, in case you're wondering, this is definitely on us. It would
help us a lot to improve BigTest if you'd take the time to report the problem at
the following url:

${newIssueLink(error, argv)}`;


function newIssueLink(error: any, argv: string[]) {
  let message = error && error.message != null ? error.message : 'unknown error';
  let title = `CRASH: ${message}`;
  let labels = `🐛bug,@bigtest/cli`;
  let body = getIssueBody(error, argv);
  return uriEncode`https://github.com/thefrontside/bigtest/issues/new?title=${title}&labels=${labels}&body=${body}`;
}

const getIssueBody = (error: any, argv: string[]) =>
  `
<!--
Thanks for taking the time to submit a bug report. In addition to the information below, please include anything else that you think might be relevant in helping us diagnose the problem. Also, be sure to double check this issue report before submitting it to make sure it doesn't contain any non-public information.

Again, thank you so much for taking the time to improve BigTest
-->

Args
----
${argv.join(',')}

Stack
-----
${error && error.stack ? error.stack : 'none'}
`

function uriEncode(strings: TemplateStringsArray, ...values: string[]) {
  let encoded = values.map(encodeURIComponent);
  return strings.map((str, idx) => idx < values.length ? `${str}${encoded[idx]}` : str).join('');
}
