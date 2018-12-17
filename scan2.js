const prepare = require('./lib/prepare');
const path = require('path');

const config = {
  output: 'docs',
  index: 'README.md',
  publicPath: 'test',
  context: path.join(__dirname, 'test/fixtures'),
  contents: {
    'Getting started': 'src/index.md',
    components: {
      title: 'Components',
      contents: '**/components/**/*.md',
    },
    controls: '**/controls/**/*.md'
  }
};

const result = prepare(config);

console.log('string', JSON.stringify(result, null, 2));
