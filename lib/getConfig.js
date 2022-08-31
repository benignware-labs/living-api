const path = require('path');
const findPackage = require('find-package-json');
const { sync: glob } = require('glob');

const PROJECT_JSON = [...findPackage()][0] || null;
const CONFIG_FILE = path.join(__dirname, '../.living-api/config.js');

function getConfig(options = {}) {
  const config = require(CONFIG_FILE);
  const { name, description } = PROJECT_JSON;
  const packageInfo = {
    name,
    description,
    title: `${name}${description
      ? ` | ${description}`
      : ''
    }`
  };

  const [ customConfigPath, ...configs ] = glob('**/.living-api/config.js', {
    dot: true,
    cwd: process.cwd(),
    ignore: [
      'node_modules/**/*.*'
    ],
    absolute: true
  }).filter((path) => path !== CONFIG_FILE);

  const customConfig = customConfigPath
    ? require(customConfigPath)
    : {};

  return {
    ...config,
    ...packageInfo,
    ...customConfig,
    ...options
  };
};

module.exports = getConfig;
