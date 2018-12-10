const path = require('path');

module.exports = {
  layout: path.resolve(__dirname, 'layout.ejs'),
  webpack: require(path.resolve(__dirname, 'webpack.config.js'))
};
