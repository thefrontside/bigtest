if (!QUnit) {
  throw new Error('Uh, no. Come back after you have taken the `qunitjs` file, put it in a script tag and put that into a DOM somewhere');
}

export const test = QUnit.test;
export const assert = QUnit.assert;
export const skip = QUnit.skip;

// because hey, the transpiled code declares `module`
const _module = QUnit.module;
export {_module as module };
