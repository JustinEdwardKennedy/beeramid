const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, "app", "index.js"),
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|mp3)$/i,
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets'
            },
          }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        path: path.join(__dirname, "public"),
        filename: "bundle.js",
        publicPath: "/"
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: "Beeramid",
            template: path.join(__dirname, "app", "index.html"),
            favicon: path.join(__dirname, "app", "favicon.png")
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, "app"),
        hot: true,
        port: 3000,
        compress: true,
        historyApiFallback: true
    }
};
