const path = require('path');

module.exports = {
  title: 'Styleguide',
  entry: '**/*.md',
  baseDir: '/',
  output: path.join(process.cwd(), 'docs'),
  templates: {
    code: path.join(__dirname, 'templates/code.ejs'),
    main: path.join(__dirname, 'templates/main.ejs'),
    embed: path.join(__dirname, 'templates/embed.ejs')
  },
  navigation: {
    items: [
    ]
  }
}
