const path = require('path');

function getNestedItems(list) {
    var map = {}, node, roots = [], i;
    let id;
    let dir;

    for (i = 0; i < list.length; i += 1) {
      id = path.join(list[i].dir, list[i].base);
      //console.log('***** ', id);
      //id = list[i].dir ? [ list[i].dir , list[i].base ].join('/') : list[i].base;
      map[id] = i; // initialize the map
      list[i].items = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.dir !== '') {
            // if you have dangling branches check that map[node.parentId] exists
            //console.log('CHECK', node.dir, map, list[map[node.dir]]);
            //if (list[map[node.dir]]) {
              list[map[node.dir]].items.push(node);
            //}
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

    //result.push({ dir, name, base, root, ext });

    return result;
  }, []);
}

const getPathTree = function(items) {
  /*console.log('*****************');
  console.log(JSON.stringify(items, null, 2));
  console.log('*****************');
  console.log(JSON.stringify(getParentItems(items), null, 2));*/

  return {
    items: getNestedItems([
      ...items,
      ...getParentItems(items)
    ])
  };
}

module.exports = getPathTree;
