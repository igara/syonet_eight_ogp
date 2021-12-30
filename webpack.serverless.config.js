const webpack = require('webpack');
const slsw = require('serverless-webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const enviroment = process.env.NODE_ENV || 'development';

module.exports = {
  devtool: enviroment === 'development' ? 'source-map' : false,
  mode: enviroment,
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals()],
  plugins: [
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: "NotoSansJP-Regular.otf",
    //       to: "./src/ogp",
    //       context: "./src/ogp",
    //     },
    //     {
    //       from: "ogp.png",
    //       to: "./src/ogp",
    //       context: "./src/ogp",
    //     },
    //   ],
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: 'tsconfig.json',
      }),
    ],
  },
};
