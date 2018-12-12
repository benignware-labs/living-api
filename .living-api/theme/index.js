const path = require('path');

console.log('THEME!!!!');

module.exports = {
  name: 'Living Api',
  layout: path.resolve(__dirname, 'layout.ejs'),
  webpack: require(path.resolve(__dirname, 'webpack.config.js')),
  properties: {
    primary: 'lightblue'
  }
};
