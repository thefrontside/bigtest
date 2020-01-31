import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [{
    format: 'umd',
    name: 'BigTest.Convergence',
    file: pkg.main
  }, {
    format: 'es',
    file: pkg.module
  }],
  plugins: [
    babel({
      babelrc: false,
      comments: false,
      presets: [
        ['@babel/preset-env', {
          modules: false
        }]
      ]
    })
  ]
};
