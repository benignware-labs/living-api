const path = require('path');
const { sync: glob } = require('glob');

const mode = process.env.NODE_ENV || 'development';
const context = path.join(__dirname);

const entryFiles = glob(`{${[
  '**/theme.js',
  '**/index.css'
].join(',')}}`, {
  cwd: context,
  ignore: ['node_modules/**/*.*'],
  realpath: true
});

const cssLoaders = [{
  loader: 'style-loader'
}, {
  loader: "css-loader",
}];

console.log('THEME ENTRIES', entryFiles);

module.exports = {
  context,
  mode,
  entry: entryFiles,
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
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'node_modules'),
      __dirname,
    ]
  }
};
