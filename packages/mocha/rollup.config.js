import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import eslint from 'rollup-plugin-eslint';

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
    eslint({
      exclude: 'node_modules/**',
      "include": [
        "**/*.js"
      ]
    }),
    resolve(),
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
