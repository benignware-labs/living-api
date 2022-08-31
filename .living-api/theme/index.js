const path = require('path');

module.exports = {
  layout: path.resolve(__dirname, 'layout.ejs'),
  webpack: require(path.resolve(__dirname, 'webpack.config.js')),
  markdown: {
    extensions: [
      ...Object.entries({
        blockquote: 'ld-Blockquote',
        table: 'ld-Table',
        thead: 'ld-Table-head',
        tbody: 'ld-Table-body',
        th: 'ld-Table-header',
        td: 'ld-Table-data',
        tr: 'ld-Table-row',
        h1: 'ld-Heading ld-Heading--1',
        h2: 'ld-Heading ld-Heading--2',
        h3: 'ld-Heading ld-Heading--3',
        h4: 'ld-Heading ld-Heading--4',
        ul: 'ld-List',
        li: 'ld-ListItem',
      }).map(([ key, value ]) => ({
        type: 'output',
        regex: new RegExp(`<${key}(?:\\s+(.*))?>`, 'g'),
        replace: `<${key} class="${value}" $1>`
      }))
    ]
  }
};
