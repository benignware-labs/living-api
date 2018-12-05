const path = require('path');
const { sync: glob } = require('glob');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const WebpackDevServer = require('webpack-dev-server');

const getConfig = require('./getConfig');

function getWebpackConfig(config = {}) {
  const { webpackConfig: customWebpackConfig, output, entry } = config;
  const context = customWebpackConfig && customWebpackConfig.context || config.context || process.cwd();

  const webpackConfig = webpackMerge(
    customWebpackConfig,
    {
      context,
      entry: glob(entry, {
        cwd: context,
        ignore: ['node_modules/**/*.*'],
        // nosort: true,
        realpath: true,
        //absolute: true
      }),
      mode: 'development',
      output: {
        path: path.resolve(output),
        filename: 'main.js'
      },
      module: {
        rules: [{
          test: /\.(md)/,
          use: [{
            loader: "file-loader",
            options: {
              name: "[path][name].html",
              emitFile: true
            }
          }, {
            loader: 'extract-loader'
          }, {
            loader: 'html-loader',
            options: {
              attrs: [
                'img:src',
                'link:href',
                'include:src'
              ]
            }
          }, {
            loader: 'living-api-loader',
          }
          ]
        }]
      },
      devServer: {
        hot: true,
        index: 'index.html',
        port: 9393,
        open: true
      },
      resolveLoader: {
        alias: {
          'living-api-loader': path.join(__dirname, 'loader')
        }
      }
    }
  );

  return webpackConfig;
}


function build(config) {
  config = getConfig(config);
  const webpackConfig = getWebpackConfig(config);

  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      // Handle errors here
      console.log(stats);
    }
    // Done processing
  });
}


function watch(config) {
  config = getConfig(config);
  const webpackConfig = getWebpackConfig(config);
  const compiler = webpack(webpackConfig);
  const watching = compiler.watch({
    // Example watchOptions
    aggregateTimeout: 300,
    poll: undefined
  }, (err, stats) => {
    // Print watch/build result here...
    console.log(stats);
  });
}

function start(config) {
  config = getConfig(config);
  console.log('config', config);
  const webpackConfig = getWebpackConfig(config);
  const compiler = webpack(webpackConfig);
  const devServerOptions = Object.assign({}, webpackConfig.devServer, {
    open: true,
    hot: true,
    contentBase: "./docs",
    stats: {
      colors: true
    }
  });
  const server = new WebpackDevServer(compiler, devServerOptions);

  server.listen(8080, '127.0.0.1', () => {
    console.log('Starting server on http://localhost:8080');
  });
}

module.exports = {
  build,
  watch,
  start
};
