const path = require('path');

module.exports = {
  title: 'Styleguide',
  entry: '**/*.md',
  publicPath: '/',
  output: path.resolve(process.cwd(), 'docs'),
  template: path.join(__dirname, 'template.ejs'),
  theme: {
    options: {
      properties: {
        primary: 'lightblue'
      }
    }
  },
  webpack: require(
    path.resolve(__dirname, './webpack.config.js')
  ),
  navigation: {
    items: [
    ]
  },
  devServer: {
    index: 'index.html',
    open: true,
    hot: true,
    inline: true,
    port: 8080,
    historyApiFallback: true,
    //contentBase: path.join(process.cwd(), 'src'),
    contentBase: './',
    stats: {
      colors: true
    }
  }
}
