const path = require('path');
const uniqid = require('uniqid');

const getConfig = require('./getConfig');

const config = getConfig();


const getItem = (item, current, rootContext) => {
  let dir;

  item = {
    //id: uniqid(),
    ...item,
    items: item.items ? item.items.map(child => getItem(child, current)) : []
  };

  if (typeof item.path !== 'undefined') {
    //item.url = item.path && path.join('.', path.relative(current.path, item.path));
    item.url = item.path;
  } else {
    //console.log('OH NO, NO PATH', item.path, 'DIR?', item.dir);
    if (item.items.length > 0) {
      dir = path.dirname(item.items[0].path);
      //console.log('let us try to get it by its children...', dir);
      if (item.items.every(child => child.path && path.dirname(child.path) === dir)) {
        console.log('CREATE ITEM PATH', dir);
        item.path = dir;
        Object.assign(item, path.parse(dir));
      }
      //console.log('here you go: ', item.path);
    }
  }

  if (typeof item.path === 'undefined') {
    console.log('***************** OH NO');
  } else {
    console.log('----', item.path, item.items.length);
  }

  if (typeof item.path !== 'undefined') {
    item.id = 'ld-href-' + item.path.replace(/\//g, '_');
  } else {
    item.id = uniqid();
  }

  const isActiveLink = typeof current.url !== 'undefined' && typeof item.url !== 'undefined' && item.url.startsWith(current.url);
  const isActiveParent = item.items.length > 0 && item.items.some(child => child.active);

  /*
  console.log('IS ACTIVE LINK?', current.path, item.path, item.path.startsWith(current.path));
  console.log('IS ACTIVE PARENT?', current.path, item.path, item.items.length, item.items.some(child => child.active));
  console.log('IS ACTIVE?', item.path, isActiveLink, isActiveParent);
  console.log('----');*/

  item.active = isActiveLink || isActiveParent;

  return item;
};


const getNavigation = (resourcePath = '', rootContext = '') => {
  const root = {
    items: [],
    ...path.parse(config.publicPath),
    path: '',
    //url: path.relative(resourcePath, ''),
    //url: '',
    ...config.navigation
  };

  const current = {
    items: [],
    ...path.parse(resourcePath),
    path: resourcePath,
    url: resourcePath
  };

  console.log('CURRENT', current.path);

  return getItem(root, current, rootContext);
};

module.exports = {
  getNavigation
};
