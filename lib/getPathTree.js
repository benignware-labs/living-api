const path = require('path');

function getNestedItems(list) {
  const map = {};

  let node;
  let roots = [];
  let i;
  let id;
  let dir;

  for (i = 0; i < list.length; i += 1) {
    id = path.join(list[i].dir, list[i].base);
    map[id] = i;
    list[i].items = [];
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.dir !== '') {
      list[map[node.dir]].items.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function getParentItems(items) {
  const parents = {};

  return items.reduce((result, item, index) => {
    const { dir, name, base, root, ext } = item;
    const segs = dir.split('/');

    if (dir) {
      for (let i = 0; i < segs.length; i++) {
        const id = segs.slice(0, i + 1).join('/');
        if (!parents[id]) {
          // Create parent item
          const parent = {
            root: root,
            name: segs[i],
            base: segs[i],
            dir: segs.slice(0, i).join('/'),
            ext: ''
          };
          parents[id] = parent;
          // Add item to result list
          result.push(parents[id]);
        } else {
          //break;
        }
      }
    }

    return result;
  }, []);
}

const getPathTree = function(items) {
  return {
    items: getNestedItems([
      ...items,
      ...getParentItems(items)
    ])
  };
}

module.exports = getPathTree;
