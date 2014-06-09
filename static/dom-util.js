addHandler = function(ev, fn) {
  return window.addEventListener(ev, fn);
}
addH = function(obj, ev, fn) {
  return obj.addEventListener(ev, fn);
}
addMouse = function(obj, handlers) {
  addH(obj, 'click', function(ev) {
    handlers.left();
  });
  addH(obj, 'contextmenu',  function(ev) {
    handlers.right();
    ev.preventDefault();
  });
}
addKey = function(obj, handler) {
  addH(obj, 'keypress', function(ev) {
    //console.log('code ', ev.keyCode);
    var c = String.fromCharCode(ev.keyCode);
    if (ev.keyCode === 13) {
      c = '\n';
    }
    handler(c);
  });
  addH(obj, 'keydown', function(ev) {
    //console.log('down', ev.keyCode);
    var c;
    if (ev.keyCode === 17) {
      c = 'CTRL';
    } else if (ev.keyCode === 27) {
      c = 'ESC';
    } else {
      return;
    }
    handler(c);
  });
}

createElement = function(type, cl, id) {
  var entry = document.createElement(type);
  entry.setAttribute('class', cl);
  entry.setAttribute('id', id);
  entry.setAttribute('tabindex', 1);
  return entry;
}
createDiv = function(parent, cl, id) {
  return parent.appendChild(createElement('div', cl, id));
}
createText = function(object, text) {
  var node = object.appendChild(document.createTextNode(text));
  return node;
}
getElement = function(id) {
  return document.getElementById(id);
}
appendId = function(parent_id, node) {
  return getElement(parent_id).appendChild(node);
}
appendDoc = function(node) {
  return getElement('main').appendChild(node);
}

module.exports = {
  addMouse: addMouse,
  addKey: addKey,

  createElement: createElement,
  createDiv: createDiv,
  createText: createText,
  appendId: appendId,
  appendDoc: appendDoc,

  getElement: getElement,
}
