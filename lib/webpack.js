const path = require('path');
const fs = require('fs');
const { sync: glob } = require('glob');
const webpack = require('webpack');
const { merge: webpackMerge } = require('webpack-merge');
const htmlLoader = require('html-loader');
const WebpackDevServer = require('webpack-dev-server');

const getConfig = require('./getConfig');
const prepare = require('./prepare');

function getWebpackConfig(config = {}) {
  config = getConfig(config);
  const { webpack: appWebpackConfig = {} } = config;
  const { entry: configEntry, resources, ...prepared } = prepare(config);

  const appEntries = appWebpackConfig && appWebpackConfig.entry
    ? appWebpackConfig.entry.filter(file => path.extname(file) !== '.html')
    : [];

  const appEntriesWebpackConfig = {
    ...appWebpackConfig,
    entry: appEntries
  };

  if (!configEntry.length) {
    return appEntriesWebpackConfig;
  }

  // const entry = [...new Set([...configEntry, ...appEntries])];

  const webpackConfig = webpackMerge(
    {
      module: {
        rules: [
          {
            test: /\.css/,
            use: [
              require.resolve('style-loader'),
              require.resolve('css-loader')
            ]
          },
          /*{
            test: /\.js/,
            use: [
              require.resolve('babel-loader'),
            ]
          }*/
        ]
      }
    },
    appEntriesWebpackConfig,
    {
      mode: 'development',
      entry: configEntry,
      output: {
        path: config.output,
        publicPath: config.publicPath,
        filename: 'main.js',
        assetModuleFilename: "[name][ext]",
      },
      module: {
        rules: [{
          test: /\.(md)/,
          use: [{
            loader: require.resolve('file-loader'),
            options: {
              emitFile: true,
              name: file => resources[file] || '[path][name].html'
            }
          }, {
            loader: require.resolve('extract-loader'),
            options: {
              publicPath: config.publicPath
            }
          }, {
            loader: require.resolve('html-loader'),
            options: {
              sources: {
                urlFilter: (attribute, value, resourcePath) => {
                  return fs.existsSync(path.resolve(resourcePath, value));
                },
              }
            }
          }, {
            loader: 'living-api-loader',
            options: { config, resources, ...prepared }
          }]
        }]
      },
      resolveLoader: {
        alias: {
          'living-api-loader': path.join(__dirname, '../lib/loader')
        }
      }
    }
  );

  const themeWebpackConfig = webpackMerge(
    config.theme.webpack,
    {
      output: {
        path: config.output,
        publicPath: config.publicPath,
        filename: 'theme.js',
      },
    }
  );

  return [
    themeWebpackConfig,
    webpackConfig
  ];
}


function build(config) {
  config = getConfig(config);
  const webpackConfig = getWebpackConfig(config);

  /*
  if (!webpackConfig.entry || !webpackConfig.entry.length) {
    throw 'No entry was provided.';
    process.exit();
  }*/

  webpack(webpackConfig, (err, stats) => {
    if (err || stats && stats.hasErrors()) {
      // Handle errors here
      console.log(stats && stats.toString());
      console.log(err);
      process.exit(1);
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
    if (err || stats.hasErrors()) {
      // Handle errors here
      console.log(stats.toString());
      console.log(err);
      process.exit(1);
    }
    // Done processing
  });
}

function start(config) {
  config = getConfig(config);
  const webpackConfig = getWebpackConfig(config);

  const { port } = config.devServer;

  for (let wpc of webpackConfig) {
    wpc.entry.unshift(
      `webpack-dev-server/client?http://localhost:${port}/`,
      `webpack/hot/dev-server`
    );

    wpc.plugins = [
      ...(wpc.plugins || []),
      new webpack.HotModuleReplacementPlugin()
    ];
  }

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, {
    ...config.devServer
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Starting dev-server on http://localhost:${port}`);
  });
}

module.exports = {
  build,
  watch,
  start
};
