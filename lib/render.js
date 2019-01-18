const ejs = require('ejs');
const fs = require('fs');
const escape = require('escape-html');
const showdown  = require('showdown');
const hljs = require('highlight.js');

function render(template, data, options) {
  const content = fs.readFileSync(template, 'utf-8');
  return ejs.render(content, data, {
    filename: template
  });
}

function renderSample(doc) {
  const { blocks, attributes, url, source } = doc;

  const highlightedBlocks = blocks.map(({ lang, code }) => ({
    lang,
    code,
    highlighted: lang && hljs.getLanguage(lang)
      ? hljs.highlight(lang, code.trim()).value
      : hljs.highlightAuto(code.trim()).value
  }));

  const sample = `
<section>
  <div${Object.entries(attributes).map(([ name, value ]) => ` ${name}="${value}"`).join('')}>
    ${source}
  </div>
  ${highlightedBlocks.map(({lang, code, highlighted }) => (
    `<pre data-lang="${lang}"><code data-lang="${lang}" class="code ${lang} hljs">${highlighted}</code></pre>`
  )).join('\n')}
</section>
`;

  return sample;
}


function renderMarkdown(source, options) {

  source = source.replace(/<pre/g, '<div data-xxx-pre');
  source = source.replace(/<code/g, '<div data-xxx-code');

  const converter = new showdown.Converter({
    tables: true,
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

function renderMarkdownBody(source) {
  return `<div class="markdown-body">${source}</div>`;
}

module.exports = {
  render,
  renderSample,
  renderMarkdown,
  renderMarkdownBody
};
