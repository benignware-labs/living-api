const path = require('path');
const { sync: glob } = require('glob');
const merge = require('merge-deep');

function getConfig(options = {}) {

  const baseConfig = require('../.living-api/config');
  const baseTheme = require('../.living-api/theme');

  let [ config ] = [
    ...glob('**/.living-api/config.js', {
      dot: true,
      cwd: process.cwd(),
      ignore: [
        'node_modules/**/*.*'
      ],
      absolute: true
    })
  ].map((path) => require(path));

  config = merge(baseConfig, config, options);

  config.theme = merge(baseTheme, config.theme);

  return config;
};

module.exports = getConfig;
