const ejs = require('ejs');
const fs = require('fs');
const escape = require('escape-html');
const showdown = require('showdown');
const hljs = require('highlight.js');

function render(template, data, options) {
  const content = fs.readFileSync(template, 'utf-8');
  return ejs.render(content, data, {
    filename: template
  });
}

function renderSample(doc) {
  const { blocks, attributes, url, source } = doc;

  const highlightedBlocks = blocks.map(({ lang, code }) => {
    return ({
      lang,
      code,
      highlighted: lang && hljs.getLanguage(lang)
        ? hljs.highlight(lang, code.trim()).value
        : hljs.highlightAuto(code.trim()).value
    });
  });

  const highlightedBlocksString = highlightedBlocks.map(({lang, code, highlighted }) => (
    `<pre data-lang="${lang}"><code data-lang="${lang}" class="code ${lang} hljs">${highlighted}</code></pre>`
  )).join('\n')
  

  const sample = `
<section>
  <div${Object.entries(attributes).map(([ name, value ]) => ` ${name}="${value}"`).join('')}>
    ${source}
  </div>
  ${highlightedBlocksString}
</section>
`;

  return sample;
}

function renderMarkdown(source, options) {
  source = source.replace(/<pre/g, '<div data-xxx-pre="1"');
  source = source.replace(/<code/g, '<div data-xxx-code="1"');

  const converter = new showdown.Converter({
    tables: true,
    simpleLineBreaks: true,
    requireSpaceBeforeHeadingText: true,
    ghCodeBlocks: true,
    omitExtraWLInCodeBlocks: false,
    backslashEscapesHTMLTags: true,
    ...options
  });
  let html = converter.makeHtml(source);

  html = html.replace(/<div\sdata-xxx-pre="1"/g, '<pre');
  html = html.replace(/<div\sdata-xxx-code="1"/g, '<code');

  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function renderMarkdownBody(source) {
  return source;
}

module.exports = {
  render,
  renderSample,
  renderMarkdown,
  renderMarkdownBody
};
