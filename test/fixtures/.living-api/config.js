const path = require('path');

module.exports = {
  title: 'LIGHTELLIGENCE® UI',
  context: path.join(__dirname, '../src'),
  output: path.join(process.cwd(), '/docs'),
  entry: '**/*.md',
  webpack: require('../webpack.config.js'),
  navigation: {
    items: [
      {
        label: 'Index',
        path: 'index.html',
      },
      {
        label: 'Components',
        items: [
          {
            label: 'Button',
            path: 'scss/components/Button/Button.html',
          },
        ]
      },
      {
        label: 'Controls',
        items: [
          {
            label: 'TextField',
            path: 'scss/controls/TextField/TextField.html',
          },
        ]
      }
    ]
  }
}
