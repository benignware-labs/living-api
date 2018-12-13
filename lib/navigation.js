const path = require('path');
const uniqid = require('uniqid');

const getConfig = require('./getConfig');

const config = getConfig();


const getItem = (item, current, rootContext) => {
  let dir;

  item = {
    id: uniqid(),
    ...item,
    items: item.items ? item.items.map(child => getItem(child, current)) : []
  };

  if (item.path) {
    //item.url = item.path && path.join('.', path.relative(current.path, item.path));
    item.url = item.path;
  }

  item.active = item.path && item.path.startsWith(current.path) || item.items.some(child => child.active);

  return item;
};


const getNavigation = (resourcePath = '', rootContext = '') => {
  const root = {
    items: [],
    ...path.parse(config.publicPath),
    path: '',
    //url: path.relative(resourcePath, ''),
    url: '',
    ...config.navigation
  };

  const current = {
    items: [],
    ...path.parse(resourcePath),
    path: resourcePath,
    url: resourcePath
  };

  return getItem(root, current, rootContext);
};

module.exports = {
  getNavigation
};
