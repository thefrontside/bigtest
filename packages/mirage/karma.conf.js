module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit', 'jquery-2.1.4'],

    // files to watch
    files: [
      { pattern: 'lib/**/*.js', served: false, included: false },
      'tests/index.js'
    ],

    // processors per file
    preprocessors: {
      'tests/index.js': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // webpack configuration
    webpack: require('./webpack.config.js'),

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
    ],

    // enable the browser UI
    client: {
      clearContext: false,
      qunit: {
        showUI: true,
        testTimeout: 5000
      }
    }
  });
};
