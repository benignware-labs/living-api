const { sync: glob } = require('glob');
const slugify = require('slugify');
const humanizeString = require('humanize-string');
const { camelize, decamelize } = require('humps');
const path = require('path');
console.log('SCAN...');

const isPlainObject = obj => obj != null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype



const context = path.resolve(__dirname, 'text/fixtures/src');

console.log('context', context);

const filesX = glob('**/*.md', {
  //root: path.resolve(context, '../../..'),
  //cwd: context,
  ignore: [
    'node_modules/**/*.*'
  ],
  //realpath: true,
  //absolute: true
})

console.log('files', filesX);
/*
const segments = files.map(file => file.split('/'));*/

//console.log('segment', segments);
//files.every(file => file.split(/\//g)[0] === )


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
glob(entry)
  .map(file => {
    console.log('MAP FILES....', file);
    const parsed = path.parse(file);

    return ({
      path: file,
      ...parsed,
      title: parsed.name,
      slug: slugify(decamelize(parsed.name, { separator: '-' }))
    });*/

const getEntryPaths = ({ entry, ...node }) => {
  console.log('process entries', entry);
  let result = [];

  if (typeof entry === 'string') {
    console.log('string path');
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



const getNode = ({ entry, ...node }, parent = null) => {
  console.log('PROCESS NODE', entry, node);

  const index = node.index || parent === null && 'README.md';
  const name = !node.name && node.title ? slugify(node.title) : '';
  const title = !node.title && node.name ? humanizeString(node.name) : '';
  const slug = node.slug || slugify(name || title);

  const result = {
    index,
    title,
    name,
    slug,
    ...node
  };

  const globOpts = {
    root: process.cwd(),
    ignore: [
      'node_modules'
    ]
  };

  if (typeof result.index === 'string') {
    const src = glob(result.index, globOpts).shift();

    console.log('INDEX ')

    if (src) {
      result.index = {
        src,
        ...path.parse(src)
      };
    } else {
      result.index = null;
    }
  }

  if (typeof entry === 'string') {
    console.log('STRING ENTRY....', entry);
    result.children = [
      ...glob(entry, globOpts)
        .map(file => {
          console.log('MAP FILES....', file);
          const parsed = path.parse(file);

          return ({
            src: file,
            ...parsed,
            title: parsed.name,
            slug: slugify(parsed.name)
          });
      })
    ];
  } else if (isPlainObject(entry)) {
    result.children = [];

    for (let name in entry) {
      let child;

      if (typeof entry[name] === 'string') {
        child = getNode({
          name,
          entry: entry[name]
        }, result);
      } else if (isPlainObject(entry[name])) {
        child = getNode({
          name,
          ...entry[name]
        }, result);
      } else if (Array.isArray(entry[name])) {
        child = {
          name,
          children: [
            ...entry[name]
          ]
        };
      }

      if (child) {
        result.children.push(child);
      }
    }
  }

  return result;
};


const flattenNodes = nodes => {
  let result = [];

  for (let node of nodes) {
    result.push(node);
    if (node.children) {
      result = result.concat(node.children);
    }
  }

  return result;
}

//const entryPaths = getEntryPaths(root);

//console.log('entryPaths', JSON.stringify(entryPaths, null, 2));

const result = getNode(root);

//console.log('result', JSON.stringify(result, null, 2));


const getEntryPoints = root => {
  const result = [];
  const flat = flattenNodes(root.children);

  if (root.index && root.index.src) {
    result.push(root.index.src);
  }

  return flat.reduce((result, node) => {
    const { src, index: { src: index } = {} } = node;
    console.log('get entry points', node);
    if (src) {
      result.push(src);
    }

    if (index) {
      result.push(index);
    }

    return result;
  }, result);
};

console.log('entryPoints', JSON.stringify(getEntryPoints(result), null, 2));
