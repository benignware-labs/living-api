const path = require('path');
const { sync: glob } = require('glob');

const context = path.join(__dirname, 'src');

module.exports = {
  context,
  mode: 'development',
  entry: glob(`{${[
    //'**/*.svg',
    '**/main.js',
    '**/index.scss',
    '**/*.svg'
  ].join(',')}}`, {
    cwd: context,
    ignore: ['node_modules/**/*.*'],
    realpath: true,
    //absolute: true
  }),
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
      test: /\.s?css$/,
      use: [/*{
        loader: "file-loader",
        options: {
          name: "[name].css",
          emitFile: true
        }
      }, {
        loader: 'extract-loader'
      }, */{
        loader: 'style-loader'
      }, {
        loader: "css-loader",
        options: {
          sourceMap: true
        }
      }, {
        loader: 'sass-loader',
        options: {
          includePaths: [
            path.resolve(__dirname, 'node_modules')
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
    },/* {
      test: /\.html/,
      use: {
        loader: 'html-loader',
        options: {},
      },
    }*/]
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
