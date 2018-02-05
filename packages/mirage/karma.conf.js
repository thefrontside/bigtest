const path = require('path');

module.exports = function(config) {
  config.set({
    frameworks: ['qunit', 'jquery-2.1.4'],
    reporters: ['mocha'],
    browsers: ['Chrome'],

    files: [
      'tests/index.js'
    ],

    preprocessors: {
      'tests/index.js': ['webpack']
    },

    // enable the browser UI
    client: {
      clearContext: false,
      qunit: {
        showUI: true,
        testTimeout: 5000
      }
    },

    webpack: {
      resolve: {
        alias: {
          qunit: path.resolve(__dirname, 'tests/qunit-shim.js'),
          jquery: path.resolve(__dirname, 'tests/jquery-shim.js'),
          '@bigtest/mirage': path.resolve(__dirname, 'lib/index.js')
        }
      },

      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
              loader: 'babel-loader',
              options: {
                presets: ['es2016']
              }
            }]
          }
        ]
      }
    },

    // webpack-dev-middleware config
    webpackMiddleware: {
      stats: 'errors-only'
    },

    // enable our plugins
    plugins: [
      require('karma-qunit'),
      require('karma-jquery'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
      require('karma-mocha-reporter')
    ]
  });
};
