module.exports = (config) => {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],
    browsers: ['Chrome'],

    files: [
      { pattern: 'tests/index.js', watched: false }
    ],

    preprocessors: {
      'tests/index.js': ['webpack']
    },

    mochaReporter: {
      showDiff: true
    },

    webpack: {
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules(?!\/@bigtest)/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/preset-env', {
                modules: false
              }]
            ]
          }
        }]
      }
    },

    webpackMiddleware: {
      stats: 'minimal'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
