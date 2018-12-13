module.exports = {
  plugins: [
    require('postcss-preset-env')(),
    require('postcss-import')(),
    require('postcss-for')(),
    //require('cssnano')(), // TODO: Minify in production,
  ],
};
