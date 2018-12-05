const path = require('path');
const escape = require('escape-html');
//const highlightjs = require('highlight.js');
const uniqid = require('uniqid');

const { getOptions, interpolateName, urlToRequest } = require('loader-utils');
const webpack = require("webpack");
const options = getOptions(this);

const getConfig = require('./getConfig');
const getPathTree = require('./getPathTree');
const { render, renderExample, renderMarkdown } = require('./render');

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

  console.log('..', [ ...store.resources ]);
  const items = [ ...store.resources ]
    .map((file) => path.parse(file))
    .map((resource) => ({
      ...resource,
      url: path.join(config.baseDir, resource.dir, resource.name + '.html')
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
  //let doc;
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
    block.url = path.join(config.baseDir, block.file);

    // Actually create files
    this.emitFile(file, block.code);
    this.addDependency(file);

    current = block;
  }

  let offset = 0;
  let content = '';
  let result = '';

  for (doc of docs) {
    content = '';

    for (block of doc.blocks) {
      switch (block.lang) {
        case 'js':
          block.embed = `
<script src="${block.url}"></script>
`;
          break;
        case 'css':
          block.embed = `
<link type="stylesheet" href="${block.url}"/>
`;
          break;
        case 'html':
          block.embed = `
${block.code}
`;
          break;
      }

      if (block.embed) {
        content += block.embed;
      }
    }

    doc.dir = relativeDir;
    doc.name = `${name}.sample${doc.id}`;
    doc.ext = '.html';
    doc.file = path.join(doc.dir, doc.name + doc.ext);
    doc.url = path.join(config.baseDir, doc.file);

    doc.source = render(config.templates.code, {
      blocks,
      content
    });

    // Emit document file
    this.emitFile(doc.file, doc.source);
    this.addDependency(file);

    // Add samples to markdown source
    const sample = render(config.templates.embed, { ...doc, config });

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

  const htmlLayout = render(config.templates.main, {
    content: htmlContent,
    config,
    tree,
    data: this.data
  });

  callback(null, htmlLayout);
}

module.exports = {
  default: loader
};


module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  console.log('PITCH');
  const relativePath = path.relative(this.rootContext, this.resourcePath);
  console.log('relativePath', relativePath);
  store.resources.add(relativePath);
  data.store = store;

  console.log('STORE', data.store);

  this.addDependency(config.templates.main);
  this.addDependency(config.templates.code);
  this.addDependency(config.templates.embed);
};
