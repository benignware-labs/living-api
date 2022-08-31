const path = require('path');
const { build } = require('..');


const assert = require('assert');
describe('build()', function() {
  it('should build', function() {
    build({
      title: 'Styleguide',
      webpackConfig: require(path.join(__dirname, 'fixtures/webpack.config.js')),
      dest: path.join(__dirname, 'dist')
    });
  });
});
