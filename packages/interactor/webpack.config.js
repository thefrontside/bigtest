const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './tests/index.ts',

  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '~$': path.resolve(__dirname, 'src/index.ts'),
      '~': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader'
      }
    ]
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
