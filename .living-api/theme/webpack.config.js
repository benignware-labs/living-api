const path = require('path');
const { sync: glob } = require('glob');

const mode = process.env.NODE_ENV || 'development';
const context = path.join(__dirname);

const cssLoaders = [
  ...(
    [{
      loader: 'style-loader'
    }]
  ), {
    loader: "css-loader",
    options: {
      //sourceMap: true
    }
  }, {
    loader: "postcss-loader",
    options: {
      /*importLoaders: 1,
      ident: 'postcss',*/
      config: {
        path: path.resolve(__dirname)
      }
      /*plugins: {
        'postcss-preset-env': {},
        'postcss-import': {},
        'postcss-for': {},
        'cssnano': {},

      }*/
    }
  }
];

module.exports = {
  context,
  mode,
  entry: glob(`{${[
    '**/main.js',
    '**/index.css'
  ].join(',')}}`, {
    cwd: context,
    ignore: ['node_modules/**/*.*'],
    realpath: true
  }),
  module: {
    rules: [{
      test: require.resolve('turbolinks'),
      use: [{
        loader: 'expose-loader',
        options: 'Turbolinks'
      }]
    }, {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env', {
                targets: {
                  browsers: [
                    'last 2 versions',
                    'safari >= 7'
                  ]
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
      test: /\.css$/,
      use: cssLoaders
    }, {
      test: /\/.*\.(jpe?g|gif|png)(\?[a-z0-9=\.]*)?$/,
      loader: 'file-loader',
      options: {
        useRelativePath: true,
        name: '[path][name].[ext]',
        emitFile: true
      }
    }, {
      test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
      loader: 'file-loader',
      options: {
        //regExp: /^.*\/node_modules/,
        //useRelativePath: true,
        publicPath: '/',
        name: '[hash].[ext]',
        emitFile: true
      }
    }]
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'node_modules'),
      __dirname,
    ]
  }
};
