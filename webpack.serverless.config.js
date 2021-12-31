const webpack = require('webpack');
const slsw = require('serverless-webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const enviroment = process.env.NODE_ENV || 'development';

module.exports = {
  devtool: enviroment === 'development' ? 'source-map' : false,
  mode: enviroment,
  entry: slsw.lib.entries,
  target: 'node',
  node: {
    __dirname: true,
  },
  externals: [nodeExternals()],
  plugins: [],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'esnext',
        },
      },
      {
        test: /\.br$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '/bin/[name].[ext]',
            },
          },
        ],
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
