import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'BigTest.Mocha',
    globals: { mocha: 'mocha' }
  },
  external: ['mocha'],
  plugins: [
    resolve(),
    commonjs(),
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
