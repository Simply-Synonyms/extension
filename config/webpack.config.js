const webpack = require('webpack'),
  path = require('path'),
  fs = require('fs'),
  CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin,
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'

// Relative to root dir
const p = (l) => path.join(__dirname, '..', l)

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: p('src/popup/index.tsx'),
    background: p('src/background/index.ts'),
    content: p('src/contentscript/index.tsx'),
    embeddedScript: p('src/contentscript/embeddedPageScript.js'),
    internalPage: p('src/pages/extensionPage.js'),
  },
  output: {
    path: p('build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        use: [
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: [

          //         ["@babel/preset-react"],

          //     ], plugins: [
          //       ["@emotion/babel-plugin"]
          //     ]
          //   }
          // },
          {
            loader: 'ts-loader',
            options: {
              configFile: p('config/tsconfig.json'),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
      {
        test: new RegExp(
          '.(' + ['jpg', 'jpeg', 'png', 'gif', 'svg'].join('|') + ')$'
        ),
        use: 'file-loader?name=[name].[ext]',
        exclude: /node_modules|icons/,
      },
      {
        test: /\.html$/,
        use: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.mjs', '.ts', '.tsx', '.js'],
    alias: {
      firebaseConfig: p('config/firebaseConfig.json'), // Path to file that contains firebase config object
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  externals: {
    browserApi: 'chrome', // Allows easy access to chrome global browser API
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // default
      DEV_API: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: p('manifest.json'),
          to: 'manifest.json',
        },
        {
          from: p('LICENSE'),
          to: 'LICENSE.txt',
        },
        {
          from: p('assets/icons'),
          to: 'icons',
        },
        {
          from: p('assets/fonts'),
          to: 'fonts',
        },
        {
          from: p('assets/img'),
          to: 'assets',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
    }),
    new HtmlWebpackPlugin({
      template: p('src/popup/popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false, // Needed to ensure that HTML files are regenerated for some reason
    }),
    new HtmlWebpackPlugin({
      template: p('src/background/background.html'),
      filename: 'background.html',
      chunks: ['background'],
      cache: false,
    }),
    ...generateInternalPageHtmlPlugins(),
  ],
}

function generateInternalPageHtmlPlugins() {
  const templateFiles = fs.readdirSync(p('src/pages'))
  return templateFiles
    .filter((item) => item.endsWith('.html'))
    .map((item) => {
      console.log(item)
      const name = item.split('.')[0]
      return new HtmlWebpackPlugin({
        template: p(`src/pages/${name}.html`),
        filename: `page/${name}.html`,
        chunks: ['internalPage'],
        cache: false,
      })
    })
}

if (devMode) {
  config.devtool = 'eval-cheap-module-source-map'
  config.watchOptions = {
    ignored: /node_modules/,
  }
} else {
  config.optimization = {
    minimize: true,
    minimizer: [
      '...', // This tells webpack to still include the default js minimizer
      new CssMinimizerPlugin(),
    ],
  }
  config.plugins.push(
    new webpack.BannerPlugin({
      banner: `The Simply Synonyms extension is licensed under the GNU General Public License (please see /LICENSE.txt). The Simply Synonyms source is available open-source on Github at https://github.com/Simply-Synonyms`,
    })
  )
}

module.exports = config
