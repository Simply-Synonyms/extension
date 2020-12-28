const webpack = require("webpack"),
  path = require("path"),
  fs = require("fs"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  HtmlWebpackPlugin = require("html-webpack-plugin")

const devMode = process.env.NODE_ENV !== "production"

const options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    popup: './src/popup/index.js',
    background: './src/background/index.js',
    content: './src/content/index.js',
    pageScript: './src/content/pageInterfaceScript.js',
    internalPage: './src/pages/extensionPage.js'
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
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + ["jpg", "jpeg", "png", "gif", "svg"].join('|') + ')$'),
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
      'NODE_ENV': 'development',
      'DEV_API': false
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: './manifest.json',
        to: 'manifest.json'
      }, {
        from: '../LICENSE',
        to: 'LICENSE.txt'
      }, {
        from: './icons',
        to: 'icons'
      }, {
        from: './fonts',
        to: 'fonts'
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
    }),
    ...generateInternalPageHtmlPlugins()
  ]
}

function generateInternalPageHtmlPlugins () {
  const templateFiles = fs.readdirSync(path.resolve('./src/pages/'))
  return templateFiles
    .filter(item => item.endsWith('.html'))
    .map(item => {
      console.log(item)
      const name = item.split('.')[0]
      return new HtmlWebpackPlugin({
        template: `src/pages/${name}.html`,
        filename: `page/${name}.html`,
        chunks: ['internalPage'],
        cache: false
      })
    })
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
    banner: `The Simply Synonyms extension is licensed under the GNU General Public License (please see /LICENSE.txt). The Simply Synonyms source is available open-source on Github at https://github.com/Simply-Synonyms`
  }))
}

module.exports = options
