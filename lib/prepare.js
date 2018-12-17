const { sync: glob } = require('glob');
const slugify = require('slugify');
const humanizeString = require('humanize-string');
const { camelize, decamelize } = require('humps');
const path = require('path');
const isPlainObject = require('is-plain-object');
const uniqid = require('uniqid');

//const isPlainObject = obj => obj != null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype

const root = {
  name: 'living-api',
  index: 'README.md',
  entry: {
    'Getting started': 'test/fixtures/src/index.md',
    'comp sd onents': {
      title: 'Components',
      entry: '**/components/**/*.md',
    },
    controls: '**/controls/**/*.md'
  }
};

/*
const getEntryPaths = ({ entry, ...node }) => {
  let result = [];

  if (typeof entry === 'string') {
    result.push(entry);
  } else if (isPlainObject(entry)) {
    for (let name in entry) {
      let entries = [];

      if (typeof entry[name] === 'string') {
        entries = getEntries({
          name,
          entry: entry[name]
        });
      } else if (isPlainObject(entry[name])) {
        entries = getEntryPaths(entry[name]);
      }

      result = result.concat(entries);
    }
  }

  return result;
}
*/


const getContentNode = ({ contents, ...node }, {
  dest = '',
  context = '',
  publicPath = '/'
}, parent = null) => {
  const index = node.index || parent === null && 'README.md' || undefined;

  const result = {
    index,
    ...node,
    id: uniqid()
  };

  const globOpts = {
    ignore: ['node_modules/**/*.*'],
    realpath: true,
    root: process.cwd(),
    cwd: context,
    ignore: ['node_modules/**/*.*'],
  };

  if (typeof result.index === 'string') {
    const src = glob(result.index, globOpts).shift();
    const { name } = path.parse(src);

    if (src) {
      result.index = {
        name,
        src,
        path: path.join(dest, `index.html`),
        dest: path.join(dest, `index.html`),
        url: path.join(publicPath, dest)
      };
    }
  }

  if (typeof contents === 'string') {
    if (contents.match(/\*/)) {
      result.contents = [
        ...glob(contents, globOpts)
          .map(src => {
            const { name } = path.parse(src);
            const slug = slugify(name).toLowerCase();
            const file = path.join(dest, `${slug}.html`);
            const url = path.join(publicPath, file);
            const title = name;

            return ({ name, src, dest: file, url, title });
        })
      ];
    } else {

      result.src = path.resolve(context, contents);
      result.dest = `${dest}.html`;
      result.url = path.join(publicPath, result.dest);
      result.contents = undefined;
    }

  } else if (isPlainObject(contents)) {
    result.contents = [];

    for (let key in contents) {
      let child = contents[key];
      let name;
      let slug;

      if (typeof child === 'string') {
        name = key;
        slug = slugify(name).toLowerCase();
        title = humanizeString(name);
        //url = path.join(publicPath, dest, slug);
        child = getContentNode({
          name,
          title,
          dest: path.join(dest, slug),
          contents: child
        }, {
          dest: path.join(dest, slug),
          context,
          publicPath
        }, result);
      } else if (isPlainObject(child)) {
        name = child.name || child.title || key;
        slug = slugify(name).toLowerCase();
        title = child.title || name;

        child = getContentNode({
          name,
          title,
          dest: path.join(dest, slug),
          //url: path.join(publicPath, dest, slug),
          ...child
        }, {
          dest: path.join(dest, slug),
          context,
          publicPath
        }, result);
      }

      if (Array.isArray(child)) {
        result.contents.push.call(result.contents, ...child);
      } else {
        result.contents.push(child);
      }
    }
  }

  return result;
};


const flattenNodes = nodes => {
  let result = [];

  for (let node of nodes) {
    result.push(node);
    if (node.contents) {
      result = result.concat(node.contents);
    }
  }

  return result;
}

const getEntryPoints = root => {
  const result = {};
  const flat = flattenNodes(root.contents);

  if (root.index && root.index.src) {
    result[root.index.src] = root.index.dest;
  }

  return flat.reduce((result, node) => {
    const { src, dest, index: { src: indexSrc, dest: indexDest } = {} } = node;
    if (src && dest) {
      result[src] = dest;
    }

    if (indexSrc && indexDest) {
      result[indexSrc] = indexDest;
    }

    return result;
  }, result);
};

const getNavigation = (node, publicPath) => {
  const { index, src, dest, contents, ...item } = node;

  item.label = item.title;
  item.path = dest && path.join(publicPath, dest);

  item.children = [];
  if (contents) {
    for (let child of contents) {
      item.children.push(getNavigation(child, publicPath));
    }
  }

  return item;
};

const prepare = config => {
  const root = getContentNode({
    index: config.index,
    url: config.publicPath,
    contents: config.contents
  }, {
    context: config.context,
    publicPath: config.publicPath,
    dest: ''
  });

  return {
    resources: getEntryPoints(root),
    navigation: getNavigation(root, config.publicPath)
  };
}

module.exports = prepare;
