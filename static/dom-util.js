w = require('./heap/heap.js');
var effect_log = new w.log();

var addHandler = function(ev, fn) {
  return window.addEventListener(ev, fn);
}
var addH = function(obj, ev, fn) {
  return obj.addEventListener(ev, fn);
}
var addMouse = function(obj, handlers) {
  addH(obj, 'click', function(ev) {
    handlers.left();
  });
  addH(obj, 'contextmenu',  function(ev) {
    handlers.right();
    ev.preventDefault();
  });
}
var addKey = function(obj, handler) {
  addH(obj, 'keypress', function(ev) {
    //console.log('code ', ev.keyCode);
    var c = String.fromCharCode(ev.keyCode);
    if (ev.keyCode === 13) {
      c = '\n';
    }
    handler(c);
    ev.preventDefault();
    ev.stopPropagation();
    return false;
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
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  });
}

var mk_add = function(parent, node) {
  return effect_log.add({type: 'add', parent: parent, node: node});
}
var mk_remove = function(parent, node) {
  return effect_log.add({type: 'remove', parent: parent, node: node});
}
//var mk_color = function(node, color) {
//  return effect_log.add({type: 'color', node: node, color: color});
//}
var entry = function(ref, node) {
  this.ref = ref;
  this.node = node;
}

var createElement = function(type, cl, id) {
  var node = document.createElement(type);
  node.setAttribute('class', cl);
  node.setAttribute('id', id);
  node.setAttribute('tabindex', 1);

  return node;
}
var createDiv = function(parent, cl, id) {
  var node = createElement('div', cl, id);
  var ref = mk_add(parent, node);
  parent.appendChild(node);
  return new entry(ref, node);
}
var createText = function(parent, text) {
  var node = document.createTextNode(text);
  var ref = mk_add(parent, node);
  parent.appendChild(node);
  return new entry(ref, node);
}
var getElement = function(id) {
  return document.getElementById(id);
}
var appendId = function(parent_id, node) {
  var parent = getElement(parent_id);
  var ref = mk_add(parent, node);
  parent.appendChild(node);
  return new entry(ref, node);
}
var appendDoc = function(node) {
  return appendId('main', node);
}
var removeElement = function(node) {
  var parent = node.parentNode;
  var ref = mk_remove(parent, node);
  parent.removeChild(node);
  return new entry(ref, node);
}

var do_effect = function(ref) {
  var entry = effect_log.look(ref);
  switch (entry.type) {
    case 'add':
      entry.parent.appendChild(entry.node);
      break;
    case 'remove':
      entry.parent.removeChild(entry.node);
      break;
  }
}
var undo_effect = function(ref) {
  var entry = effect_log.look(ref);
  switch (entry.type) {
    case 'remove':
      entry.parent.appendChild(entry.node);
      break;
    case 'add':
      entry.parent.removeChild(entry.node);
      break;
  }
}

module.exports = {
  addMouse: addMouse,
  addKey: addKey,

  createElement: createElement,
  createDiv: createDiv,
  createText: createText,
  appendId: appendId,
  appendDoc: appendDoc,
  removeElement: removeElement,

  getElement: getElement,

  effect_log: effect_log,
  do_effect: do_effect,
  undo_effect: undo_effect,
}
