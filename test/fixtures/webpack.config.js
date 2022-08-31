const path = require('path');
const { sync: glob } = require('glob');

const context = path.join(__dirname, 'src');

const entry = [
  //'@babel/polyfill',
  ...glob(`{${[
    //'**/*.svg',
    'js/main.js',
    '**/*.html',
    '**/index.scss',
    '**/*.svg'
  ].join(',')}}`, {
    cwd: context,
    ignore: ['node_modules/**/*.*'],
    realpath: true,
    // absolute: true
  })
];

module.exports = {
  context,
  mode: 'development',
  entry,
  module: {
    rules: [{
      test: /\.html/,
      use: [{
        loader: "file-loader",
        options: {
          name: "[name].html",
          emitFile: true
        }
      }, {
        loader: 'extract-loader',
      }, {
        loader: 'html-loader',
        options: {
          interpolate: true,
          attrs: [
            'img:src',
            'link:href',
            'script:src',
            'include:src'
          ]
        }
      }, {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                "targets": {
                  "esmodules": true
                }
              }
            ]
          ],
          plugins: [
            '@babel/plugin-transform-spread'
          ]
        }
      }]
    }, {
      test: /\.js$/,
      // exclude: /(node_modules|bower_components)\/jquery/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                "targets": {
                  "esmodules": true
                }
              }
            ]
          ],
          plugins: [
            '@babel/plugin-transform-spread'
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
          sassOptions: {
            includePaths: [
              path.resolve(__dirname, 'node_modules')
            ]
          }
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
  /*optimization: {
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
  },
  devServer: {
    index: 'index.html',
    open: true,
    //hot: true,
    inline: true,
    port: 8080,
    historyApiFallback: true,
    //contentBase: path.join(process.cwd(), 'src'),
    contentBase: './dist',
    stats: {
      colors: true
    }
  }*/
};
