/** @type {import("webpack").Configuration } */
module.exports = {
  mode: process.env.NODE_ENV ?? 'development',
  entry: "./src/index.tsx",
  output: { path: `${__dirname}/dist` },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: { postcssOptions: { plugins: [require("tailwindcss"), require("autoprefixer")] } }
          }
        ],
      },
    ],
  },
  resolve: { extensions: [".tsx", ".ts", ".jsx", ".js"] },
  performance: false,
};
