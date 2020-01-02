import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const extensions = ['.ts', '.js'];

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'umd',
      exports: 'named',
      name: 'BigTest.Interactor',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    }
  ],
  plugins: [resolve({ jsnext: true, extensions }), babel({ comments: false, extensions })]
};
