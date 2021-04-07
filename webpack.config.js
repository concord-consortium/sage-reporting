// 2021-04-07 -- NP: as of this moment, we are NOT building a webapp
// This file is a placeholder.

const webApp = {
  // webpack --mode=development
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  entry: { index: './src/index.ts' },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/',
  },
  devServer: {
    contentBase: __dirname + '/dist/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};


module.exports = [webApp];