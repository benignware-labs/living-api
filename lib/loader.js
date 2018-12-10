const path = require('path');
const escape = require('escape-html');
const { highlight } = require('highlight.js');
const uniqid = require('uniqid');

const { getOptions, interpolateName, urlToRequest } = require('loader-utils');
const webpack = require("webpack");
const options = getOptions(this);

const getConfig = require('./getConfig');
const getPathTree = require('./getPathTree');
const { render, renderExample, renderMarkdown } = require('./render');

const { DOMParser, XMLSerializer } = require('htmldom2');

const { mergeDocuments } = require('./dom');

const config = getConfig();

const store = {
  resources: new Set()
};

const loader = function (source) {
  const { cacheable, context, rootContext, addDependency, async, resourcePath } = this;
  const { basedir = rootContext, ...options } = getOptions(this) || {};
  const { dir, name, base } = path.parse(this.resourcePath);

  const relativeDir = path.relative(this.rootContext, path.dirname(this.resourcePath));

  const callback = async();

  const matches = [];
  const pattern = new RegExp("\n```([^\n]*)" + "\s*\n*\s*([^`]*)\s*```", "gi");

  const items = [ ...store.resources ]
    .map((file) => path.parse(file))
    .map((resource) => ({
      ...resource,
      url: path.join(config.publicPath, resource.dir, resource.name + '.html')
    }))

  const tree = getPathTree(
    items
  );

  let match;

  while (match = pattern.exec(source)) {
    matches.push(match);
  }

  const blocks = matches.map(({ 0: source, 1: lang, 2: code, ...match }) => {
    return ({ lang, code, source, ...match });
  });

  const docs = [];
  let current;
  let block;
  let ext;
  let file;
  let doc;

  // Create files from code blocks and find series for documents
  for (block of blocks) {

    const inBetween = current
      ? source
          .substring(current.index + current.source.length, block.index)
          .replace(/(\r\n\t|\n|\r\t)/gm, '')
      : '';

    const isSubsequent = inBetween.length === 0;

    if (!isSubsequent || !docs.length) {
      doc = {
        id: docs.length + 1,
        blocks: [ block ]
      };
      docs.push(doc);
    } else {
      doc = docs[docs.length - 1];
      doc.blocks.push(block);
    }

    block.id = doc.blocks.length;

    file = path.join(relativeDir, `${name}.sample${doc.id}-block${(block.id)}.${block.lang}`);
    block.file = file;
    block.url = path.join(config.publicPath, block.file);

    console.log('EMIT LANG FILE', block.file);

    // Actually create files
    this.emitFile(file, block.code);
    this.addDependency(file);

    current = block;
  }

  let offset = 0;
  let content = '';
  let result = '';

  const scripts = new Set();

  for (doc of docs) {
    content = '';

    for (block of doc.blocks) {
      switch (block.lang) {
        case 'js':
          block.embed = `<script src="${block.url}"></script>`;
          break;
        case 'css':
          block.embed = `<link type="stylesheet" href="${block.url}"/>`;
          break;
        case 'html':
          block.embed = `${block.code}`;
          break;
      }

      if (block.embed) {
        content += `\n${block.embed}\n`;
      }
    }

    doc.dir = relativeDir;
    doc.name = `${name}.sample${doc.id}`;
    doc.ext = '.html';
    doc.file = path.join(doc.dir, doc.name + doc.ext);
    doc.url = path.join(config.publicPath, doc.file);

    const bodyAttributes = {};

    const htmlString = render(config.template, {
      blocks,
      content
    });

    const htmlBodyMatch = htmlString.match(/<body([^>]*)>((.|[\n\r])*)<\/body>/);

    let bodyContent = '';
    let headContent = '';

    if (htmlBodyMatch) {
      const bodyString = htmlBodyMatch[0];
      const bodyAttrString = htmlBodyMatch[1];
      bodyContent = htmlBodyMatch[2];

      const attributesPattern = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
      const bodyAttrMatches = bodyAttrString.match(attributesPattern);

      Object.assign(bodyAttributes, ...bodyAttrMatches.map((string) => string.split('=')).map(([ name, value]) => ({
        [name]: value.trim().replace(/^["']?([^'"]+)["']?$/, '$1'.trim())
      })));
    }

    const htmlHeadMatch = htmlString.match(/<head[^>]*>((.|[\n\r])*)<\/head>/);

    if (htmlHeadMatch) {
      headContent = htmlHeadMatch[1];
      let scriptMatch;
      const scriptPattern = /<script[^>]*>(.*)<\/script>/g;

      while (scriptMatch = scriptPattern.exec(headContent)) {
        scripts.add(scriptMatch[0]);
      }
    }

    doc.source = bodyContent;

    // Emit document file
    this.emitFile(doc.file, doc.source);
    this.addDependency(file);

    // Add samples to markdown source
    let sample = `\n<section>`;
    sample += `<div${Object.entries(bodyAttributes).map(([ name, value ]) => ` ${name}="${value}"`).join('')}>`;
    sample += `\n${bodyContent.trim()}\n`;
    sample += `</div>\n`;
    sample += `${doc.blocks.map((block) =>
      `<pre class="pre"><code data-lang="${block.lang}" class="code ${block.lang} hljs">${highlight(block.lang, block.code.trim()).value}</code></pre>`
    ).join('\n')}`;
    sample += `</section>\n`;

    const startBlock = doc.blocks[0];
    const endBlock = doc.blocks[doc.blocks.length - 1];

    const startIndex = startBlock.index;
    const endIndex = endBlock.index + endBlock.source.length;

    result += source.substring(offset, startIndex);
    result += sample;
    offset = endIndex;
  }

  const htmlContent = renderMarkdown(result, {
    // options
  });

  const htmlLayout = render(config.theme.layout, {
    content: htmlContent,
    config,
    tree,
    data: this.data,
    context: path.dirname(config.theme.layout)
  });

  const scriptsString = [ ...scripts ].join('\n\r');

  const htmlString = htmlLayout.replace(/<head[^>]*>((.|[\n\r])*)<\/head>/, '<head>$1\n' + scriptsString + '</head>');

  /*const resultDom = DOMParser.parseFromString(htmlLayout, 'text/html');

  const mergedDom = mergeDocuments(resultDom, ...docs.map((doc) => doc.dom));

  const resultHTMLString = (new XMLSerializer()).serializeToString(mergedDom);*/

  callback(null, htmlString);
}

module.exports = {
  default: loader
};


module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  const relativePath = path.relative(this.rootContext, this.resourcePath);
  store.resources.add(relativePath);
  data.store = store;

  this.addDependency(config.theme.layout);
  this.addDependency(config.template);
};
