const path = require('path');

module.exports = {
  entry: {
    app: './lib/index.js'
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/public'
  },

  devtool: 'inline-source-map',

  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    historyApiFallback: true,
    publicPath: '/'
  },

  resolve: {
    alias: {
      qunit: path.resolve(__dirname, 'tests/qunit-shim.js'),
      jquery: path.resolve(__dirname, 'tests/jquery-shim.js'),
      'mirage-server': path.resolve(__dirname, 'lib/index.js')
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
};
