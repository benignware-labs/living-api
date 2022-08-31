const { sync: glob } = require('glob');
const slugify = require('slugify');
const humanizeString = require('humanize-string');
const { camelize, decamelize } = require('humps');
const path = require('path');
const isPlainObject = require('is-plain-object');
const uniqid = require('uniqid');

const getContentNode = ({ contents, ...node }, {
  dest = '',
  ...config
}, parent = null) => {

  let {
    context = '',
    publicPath = '/',
    ignore = []
  } = config;

  ignore = typeof ignore === 'string' ? [ ignore ] : ignore;
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
    ignore: [
      'node_modules/**/*.*',
      ...(ignore || [])
    ],
  };

  if (typeof result.index === 'string') {
    const src = glob(result.index, globOpts).shift();

    if (src) {
      const { name } = path.parse(src);

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
          .filter(src => !result.index || result.index.src !== src)
          .map(src => {
            const { name } = path.parse(src);
            const slug = slugify(name).toLowerCase();
            const file = path.join(dest, `${slug}.html`);
            const url = path.join(publicPath, file);
            const title = name;

            return ({ name, src, dest: file, url, title });
          })
      ]
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
          ...config,
          dest: path.join(dest, slug),
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
          ...config,
          dest: path.join(dest, slug),
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


const flattenNodes = (nodes = []) => {
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
  const { index, src, dest, contents, ...item } = node;

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

const getFiles = (pattern, options = {}) => {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  const files = patterns.reduce((result, pattern) => {
    return [...result, ...glob(pattern, {
      // dot: true,
      cwd: process.cwd(),
      ignore: [
        'node_modules/**/*.*'
      ],
      absolute: true,
      ...options
    })];
  }, []);
  
  return [...(new Set(files))];
}

const prepare = (config) => {
  const files = getFiles(config.entry);
  const md = files.filter((file) => path.extname(file) === '.md');
  const assets = files.filter((file) => path.extname(file) !== '.md');
  const contents = config.contents || md;

  const root = getContentNode({
    index: config.index,
    url: config.publicPath,
    contents: contents
  }, {
    ...config,
    dest: ''
  });

  const resources = getEntryPoints(root);
  const entry = [...new Set([
    ...Object.keys(resources),
    ...assets
  ])];

  return {
    entry,
    resources,
    navigation: getNavigation(root, config.publicPath)
  };
}

module.exports = prepare;
