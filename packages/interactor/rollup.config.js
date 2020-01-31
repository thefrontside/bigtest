import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [{
    format: 'umd',
    exports: 'named',
    name: 'BigTest.Interactor',
    file: pkg.main
  }, {
    format: 'es',
    file: pkg.module
  }],
  plugins: [
    resolve(),
    babel({ comments: false })
  ]
};
