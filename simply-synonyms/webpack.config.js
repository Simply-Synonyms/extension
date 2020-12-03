const webpack = require("webpack"),
  path = require("path"),
  fs = require("fs"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  HtmlWebpackPlugin = require("html-webpack-plugin")

const devMode = process.env.NODE_ENV !== "production"

const fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"]

const options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    popup: './src/popup/index.js',
    background: './src/background/index.js',
    content: './src/content/index.js',
    pageScript: './src/content/pageInterfaceScript.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                "targets": {
                  "chrome": "80"
                }
              }
            ]
          ],
          plugins: [[
              "@babel/plugin-proposal-class-properties"
          ]]
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        use: "file-loader?name=[name].[ext]",
        exclude: /node_modules|icons/
      },
      {
        test: /\.html$/,
        use: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      firebaseConfig: path.join(__dirname, "firebaseConfig.json") // Path to file that contains firebase config object
    }
  },
  externals: {
    browserApi: 'chrome' // Allows easy access to chrome global browser API
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'development'
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: './manifest.json',
        to: 'manifest.json'
      }, {
        from: './icons',
        to: 'icons'
      }, {
        from: '../LICENSE',
        to: 'LICENSE.txt'
      }]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css'
    }),
    new HtmlWebpackPlugin({
      template: 'src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false // Needed to ensure that HTML files are regenerated for some reason
    }),
    new HtmlWebpackPlugin({
      template: 'src/background/background.html',
      filename: 'background.html',
      chunks: ['background'],
      cache: false
    })
  ]
}

if (devMode) {
  options.devtool = "eval-cheap-module-source-map"
  options.watchOptions = {
    ignored: /node_modules/
  }
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      '...', // This tells webpack to still include the default js minimizer
      new CssMinimizerPlugin(),
    ],
  }
  options.plugins.push(new webpack.BannerPlugin({
    banner: 'For additional license information please see /LICENSE.txt. Simply Synonyms is also available open-source on Github at https://github.com/Simply-Synonyms'
  }))
}

module.exports = options
