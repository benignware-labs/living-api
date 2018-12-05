const path = require('path');
const { sync: glob } = require('glob');

const context = path.join(__dirname, 'src');

module.exports = {
  context,
  mode: 'development',
  entry: glob(`{${[
    //'**/*.svg',
    'js/main.js',
    '**/index.scss',
    '**/*.svg'
  ].join(',')}}`, {
    cwd: context,
    ignore: ['node_modules/**/*.*'],
    realpath: true,
    //absolute: true
  }),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [{
      test: /\.js$/,
      // exclude: /(node_modules|bower_components)\/jquery/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              "@babel/preset-env", {
                "targets": {
                  "browsers": ["last 2 versions", "safari >= 7"]
                }
              }
            ]
          ],
          plugins: [
            "@babel/plugin-transform-spread"
          ]
        }
      }
    }, {
      test: /\.scss$/,
      use: [{
        loader: "file-loader",
        options: {
          name: "[name].css",
          emitFile: true
        }
      }, {
        loader: 'extract-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader',
        options: {
          includePaths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'bower_components')
          ]
        }
      }]
    }, {
      test: /\/.*\.(jpe?g|gif|png)(\?[a-z0-9=\.]*)?$/,
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
        emitFile: true
      }
    }, {
      test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
        emitFile: true
      }
    }, {
      test: /\.svg/,
      use: {
        loader: 'svg-url-loader',
        options: {},
      },
    }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/](node_modules)[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: 5
        },
        svgxuse: {
          test: /svgxuse/,
          name: "svgxuse",
          chunks: "all",
          priority: 10
        }
      }
    }
  }
};
