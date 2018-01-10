import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'BigTest.Convergence'
  },
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
