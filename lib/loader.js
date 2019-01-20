const path = require('path');
const escape = require('escape-html');
const uniqid = require('uniqid');

const { getOptions, interpolateName, urlToRequest } = require('loader-utils');
const webpack = require("webpack");

const getConfig = require('./getConfig');
const getPathTree = require('./getPathTree');
const { render, renderSample, renderMarkdown, renderMarkdownBody } = require('./render');

const { DOMParser, XMLSerializer } = require('htmldom2');

const { mergeDocuments } = require('./dom');

const config = getConfig();

const loader = function (source) {
  const { cacheable, context, rootContext, addDependency, async, resourcePath, resourceQuery } = this;
  const options = {
    resources: {},
    ...getOptions(this)
  };

  const { dir, name, base } = path.parse(this.resourcePath);

  const relativePath = path.relative(this.rootContext, path.dirname(this.resourcePath));
  const relativeDir = path.dirname(relativePath);

  const dest = options.resources[resourcePath] || relativePath;

  const matches = [];
  const pattern = new RegExp("\n```([^\n]*)" + "\s*\n*\s*([^`]*)\s*```", "gi");

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

    // Actually create files
    /*this.emitFile(file, block.code);
    this.addDependency(file);*/
    current = block;
  }

  let offset = 0;
  let content = '';
  let result = '';

  const scripts = new Set();
  const samples = {};

  for (doc of docs) {
    content = '';

    for (block of doc.blocks) {
      switch (block.lang) {
        case 'js':
          block.embed = `<script>${block.code}</script>`;
          break;
        case 'css':
          block.embed = `<style>${block.code}</style>`;
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
    doc.file = path.join(path.dirname(dest), doc.name + doc.ext);
    doc.url = path.join(config.publicPath, doc.file);

    let bodyAttributes = {};

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

      bodyAttributes = Object.assign({}, ...bodyAttrMatches.map((string) => string.split('=')).map(([ name, value]) => ({
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
    doc.attributes = bodyAttributes;

    // Emit document file
    this.emitFile(doc.file, doc.source);

    const sample = renderSample(doc);

    const startBlock = doc.blocks[0];
    const endBlock = doc.blocks[doc.blocks.length - 1];

    const startIndex = startBlock.index;
    const endIndex = endBlock.index + endBlock.source.length;

    result += renderMarkdownBody(source.substring(offset, startIndex));

    const sampleId = uniqid();
    samples[sampleId] = sample;
    result += `
<!--{{${sampleId}}}-->
`;

    offset = endIndex;
  }

  result += renderMarkdownBody(source.substring(offset));

  let htmlContent = renderMarkdown(result, {
    // options
    ...(config.theme.markdown || {})
  });

  for (let [ key, value ] of Object.entries(samples)) {
    htmlContent = htmlContent.replace(`<!--{{${key}}}-->`, value);
  }

  //const navigation = getNavigation(relativePath, this.rootContext);

  const currentURL = {
    url: path.join(config.publicPath, dest),
    path: path.join(config.publicPath, dest)
  };

  const htmlLayout = render(config.theme.layout, {
    content: htmlContent,
    config,
    current: currentURL,
    navigation: options.navigation,
    data: this.data,
    context: path.dirname(config.theme.layout)
  });

  const scriptsString = [ ...scripts ].join('\n\r');

  const htmlString = htmlLayout.replace(/<head[^>]*>((.|[\n\r])*)<\/head>/, '<head>$1\n' + scriptsString + '</head>');

  //callback(null, htmlString);

  return htmlString;
}

module.exports = loader;

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  //const relativePath = path.relative(this.rootContext, this.resourcePath);

  this.addDependency(config.theme.layout);
  this.addDependency(config.template);
};
