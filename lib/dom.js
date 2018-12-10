const { DOMParser, XMLSerializer } = require('htmldom2');

const mergeDocuments = (...docs) => {
  const scripts = {};
  const bodyAttributes = {};

  let src;
  let script;
  let headElement;
  let bodyElement;
  let scriptElement;
  let i;

  for (let doc of docs) {
    headElement = doc.getElementsByTagName('head')[0];
    const scriptElements = headElement.getElementsByTagName('script');

    for (i = 0; i < scriptElements.length; i++) {
      scriptElement = scriptElements[i];

      src = scriptElement.getAttribute('src');

      if (src && !scripts[src]) {
        script = {};

        for (let { name, value } of Object.values(scriptElement.attributes)) {
          if (typeof value !== 'undefined') {
            script[name] = value;
          }
        }

        if (i === 0) {
          headElement.removeChild(scriptElement);
        }

        scripts[src] = script;
      }
    }

    bodyElement = doc.body;

    if (bodyElement) {
      for (let { name, value } of Object.values(bodyElement.attributes)) {
        if (typeof value !== 'undefined') {
          bodyAttributes[name] = value;
        }
      }
    }
  }

  const base = docs.shift();

  const result = DOMParser.parseFromString((new XMLSerializer()).serializeToString(base), 'text/html');

  headElement = result.getElementsByTagName('head')[0];

  for (script of Object.values(scripts)) {
    scriptElement = result.createElement('script');
    scriptElement.appendChild(result.createTextNode('/* SCRIPT */'));

    for (let [ name, value ] of Object.entries(script)) {
      scriptElement.setAttribute(name, value);
    }
    headElement.appendChild(scriptElement);
  }

  bodyElement = result.body;

  for ([ name, value ] of Object.entries(bodyAttributes)) {
    bodyElement.setAttribute(name, value);
  }

  return result;
}


module.exports = {
  mergeDocuments
};
