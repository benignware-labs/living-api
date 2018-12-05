const path = require('path');
const { sync: glob } = require('glob');

function getConfig(options = {}) {
  const configPath = path.join(__dirname, '../.living-api/config.js');
  const config = require(configPath);

  console.log('configPath', configPath);

  const [ customConfigPath, ...configs ] = glob('**/.living-api/config.js', {
    dot: true,
    cwd: process.cwd(),
    ignore: [
      'node_modules/**/*.*'
    ],
    absolute: true
  }).filter((path) => path !== configPath);

  console.log('path', customConfigPath, configs);

  const customConfig = customConfigPath ? require(customConfigPath) : {};

  return {
    ...config,
    ...customConfig,
    ...options
  };
};

module.exports = getConfig;
