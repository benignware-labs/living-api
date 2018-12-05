const path = require('path');
const { sync: glob } = require('glob');

function getConfig(options = {}) {
  const configPath = path.join(__dirname, '../.living-api/config.js');
  const config = require(configPath);

  const [ customConfigPath, ...configs ] = glob('**/.living-api/config.js', {
    dot: true,
    cwd: process.cwd(),
    ignore: [
      'node_modules/**/*.*'
    ],
    absolute: true
  }).filter((path) => path !== configPath);

  const customConfig = customConfigPath ? require(customConfigPath) : {};

  return {
    ...config,
    ...customConfig,
    ...options
  };
};

module.exports = getConfig;
