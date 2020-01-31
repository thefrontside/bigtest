const path = require('path');
const glob = require('glob');
const CssPlugin = require('mini-css-extract-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const local = path.join.bind(path, __dirname);
const { assign } = Object;

const commonConfig = {
  mode: 'none',
  context: local('lib/run'),

  stats: {
    all: false,
    assets: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/env', {
              modules: false
            }]
          ]
        }
      }
    ]
  }
};

const clientConfig = {
  ...commonConfig,

  name: 'client',
  entry: local('lib/run/client/main.js'),
  output: {
    path: local('dist/run/client')
  },

  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/,
        use: [
          CssPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },

  plugins: [
    new CssPlugin({
      filename: 'styles.css'
    }),
    new HtmlPlugin({
      template: local('lib/run/client/index.html')
    })
  ]
};

const adapterConfig = {
  ...commonConfig,

  name: 'adapter',

  entry: glob.sync('lib/run/adapters/*.js')
    .reduce((entry, adapter) => assign(entry, {
      [path.basename(adapter, '.js')]: local(adapter)
    }), {}),

  output: {
    path: local('dist/run/adapters'),
    filename: '[name].js',
    library: '__bigtest__',
    libraryTarget: 'umd'
  }
};

module.exports = [
  clientConfig,
  adapterConfig
];
