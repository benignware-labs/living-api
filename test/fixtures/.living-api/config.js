const path = require('path');

module.exports = {
  title: 'Hadkfsjla',
  context: path.join(__dirname, '../src'),
  output: 'docs',
  entry: '**/*.md',
  navigation: {
    items: [
      {
        label: 'Introduction',
        url: '/',
        items: []
      }
    ]
  }
}
