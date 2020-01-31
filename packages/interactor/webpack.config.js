const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'none',
  entry: './tests/index.js',

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },

  devServer: {
    stats: 'minimal',
    port: 3000
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Interactor Tests'
    })
  ]
};
