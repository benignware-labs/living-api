const ejs = require('ejs');
const fs = require('fs');
const escape = require('escape-html');
//const markdown = require( "markdown" ).markdown;
//const MarkdownIt = require('markdown-it');
const showdown  = require('showdown');

// TODO: precompile syntax highlighting
//const hljs = require('highlight.js');

function render(template, data, options) {
  const content = fs.readFileSync(template, 'utf-8');
  return ejs.render(content, data, {
    filename: template
  });
}

/*function renderExample({ url, file, blocks }) {
  const sample = `

<!-- @sample '${file}' -->

<section class="example">

  <iframe class="frame" width="100%" frameborder="0" src="${url}"> </iframe>

${blocks.map(({ id, lang, code }) => `
  <pre>
    <code data-lang="${lang}" id="code-${id}" class="code ${lang}">${code}</code>
  </pre>
`).join('')}

</section>
`;
  return sample;
}*/

/*
function renderExample(template, data) {
  const content = fs.readFileSync(template, 'utf-8');

  return ejs.render(content, data, {
    filename: template
  });
}
*/
//const md = new MarkdownIt();

function renderMarkdown(source, options) {

  source = source.replace(/<pre/g, '<div data-xxx-pre');
  source = source.replace(/<code/g, '<div data-xxx-code');

  const converter = new showdown.Converter({
    ghCodeBlocks: false,
    omitExtraWLInCodeBlocks: true,
    //backslashEscapesHTMLTags: true
  });
  let html = converter.makeHtml(source);

  html = html.replace(/<div\sdata-xxx-pre/g, '<pre');
  html = html.replace(/<div\sdata-xxx-code/g, '<code');

  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

module.exports = {
  render,
  //renderExample,
  renderMarkdown
};
