const path = require('path');

module.exports = {
  title: 'My Living Styleguide',
  context: path.join(__dirname, '../src'),
  output: path.join(process.cwd(), '/docs'),
  entry: '**/*.md',
  webpack: require('../webpack.config.js'),
  theme: {
    options: {
      properties: {
        primary: 'lightblue'
      }
    }
  },
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
