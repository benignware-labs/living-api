const path = require('path');

module.exports = {
  title: 'Hadkfsjla',
  context: path.join(__dirname, '../src'),
  output: path.join(process.cwd(), '/docs'),
  entry: '**/*.md',
  webpack: require('../webpack.config.js'),
  navigation: {
    items: [
      {
        label: 'Index',
        url: '/',
        items: []
      },
      {
        label: 'Components',
        items: [
          {
            label: 'Button',
            url: '/scss/components/Button/Button.html',
            items: []
          },
        ]
      }
    ]
  }
}
