const path = require('path');

module.exports = {
  title: 'Styleguide',
  context: path.join(__dirname, '..'),
  output: path.join(process.cwd(), '/docs'),
  publicPath: '/',
  webpack: require('../webpack.config.js'),
  index: 'README.md',
  ignore: '**/Ignored.md',
  contents: {
    'Getting started': 'src/index.md',
    components: {
      title: 'Components',
      contents: '**/components/*/*.md',
    },
    content: '**/content/*/*.md',
    controls: '**/controls/*/*.md'
  }
}
