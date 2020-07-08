export class SuiteError extends Error {
  constructor() {
    super("suite failed")
  }

  name = "SuiteError";
  effectionSilent = true;
  effectionExitCode = 1;
}
