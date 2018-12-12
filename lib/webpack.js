const path = require('path');
const { sync: glob } = require('glob');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const WebpackDevServer = require('webpack-dev-server');

const getConfig = require('./getConfig');

function getWebpackConfig(config = {}) {
  config = getConfig(config);
  const { webpack: docsWebpackConfig } = require(path.resolve(__dirname, '../.living-api/config.js'));
  const { webpack: appWebpackConfig, output, entry } = config;

  let context = config.context || appWebpackConfig && appWebpackConfig.context || process.cwd();

  context = path.resolve(context);

  console.log('***** CONTEXT: ', context);
  console.log('***** OUTPUT', config.output);

  const webpackConfig = webpackMerge(
    appWebpackConfig,
    {
      mode: 'development',
      context,
      entry: [
        ...glob(entry, {
          cwd: context,
          ignore: ['node_modules/**/*.*'],
          // nosort: true,
          realpath: true,
          //absolute: true
        })
      ],
      output: {
        path: config.output,
        publicPath: '/',
        filename: 'main.js',
      },
    },
    docsWebpackConfig
  );

  const themeContext = path.resolve(__dirname, '../.living-api/theme');

  console.log('theme context', themeContext, config.output);

  const themeWebpackConfig = webpackMerge(
    config.theme.webpack,
    {
      //context: themeContext,
      mode: 'development',
      output: {
        path: config.output,
        filename: 'theme.js',
      },
    }
  );

  console.log('themeWebpackConfig', themeWebpackConfig);

  return [
    themeWebpackConfig,
    webpackConfig
  ];
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
  const webpackConfig = getWebpackConfig(config);

  const { port } = config.devServer;

  const hotConfig = webpackConfig[0];

  hotConfig.entry && hotConfig.entry.unshift(
    `webpack-dev-server/client?http://localhost:${port}/`,
    `webpack/hot/dev-server`
  );

  hotConfig.plugins = [
    ...(hotConfig.plugins || []),
    new webpack.HotModuleReplacementPlugin()
  ];

  /*
  for (let wpc of webpackConfig) {
    console.log('HOT:');
    wpc.entry && wpc.entry.unshift(
      `webpack-dev-server/client?http://localhost:${port}/`,
      `webpack/hot/dev-server`
    );

    wpc.plugins = [
      ...(wpc.plugins || []),
      new webpack.HotModuleReplacementPlugin()
    ];
  }*/

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, {
    ...config.devServer
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Starting server on http://localhost:${port}`);
  });
}

module.exports = {
  build,
  watch,
  start
};
