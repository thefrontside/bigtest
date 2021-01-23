import path from 'path';

const cwd = process.cwd();
const tsConfig = path.join(cwd, 'test', 'tsconfig.json');

export default {
  rootDir: cwd,
  globals: {
    __DEV__: true,
    'ts-jest': {
      tsconfig: tsConfig,
      isolatedModules: true,
    },
  },
  transform: {
    '.(ts|tsx|js)$': require.resolve('ts-jest/dist'),
    '.(js|jsx)$': require.resolve('babel-jest')
  },
};
