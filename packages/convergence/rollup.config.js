import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';


export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'BigTest.Convergence'
  },
  plugins: [
    eslint({
      exclude: 'node_modules/**',
      "include": [
        "**/*.js"
      ]
    }),
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
