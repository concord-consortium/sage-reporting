// 2021-04-13 -- NP: OK now we are building a simple webapp
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
  entry: { app: './src/components/app.tsx' },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist/',
  },
  devServer: {
    contentBase: __dirname + '/dist/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "components", "index.html"),

    })
  ]
};


module.exports = [webApp];