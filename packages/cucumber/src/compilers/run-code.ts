import vm from 'vm';

export const runCode = (code: string) => {
  vm.runInNewContext(code, { exports: {}, module: {}, require: require });
};
