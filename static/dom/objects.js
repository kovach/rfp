var _ = require('underscore');
var util = require('../util/util.js');
var o = require('../base/objects.js');

//var dom_extern = require ('../dom-util.js');

var mk_dom_constants = function() {
  rptr('li').mod(mk('li'));
  rptr('div').mod(mk('div'));
  rptr('log-entry').mod(mk('log-entry'));
  rptr('log-token').mod(mk('log-token'));
  rptr('id').mod(mk('id'));

  rptr('counter').mod(mk(0));
}

var fresh_name = function() {
  var name = r('counter');
  l('counter').mod(mk(1 + name.head));
  return name;
}

var div_mouse_over = function() {
}
var div_mouse_out = function() {
}
var div_get_node = function(self) {
  return dom_extern.getElement(self.r('id').head);
}
// Make element, append to main
var mk_elem = function(parent_id, obj, type, cl) {
  var elem = obj;
  //var elem = call(r('init_obj'), obj);
  newptr(elem, 'id').mod(call(r('fresh_name')));
  var node = dom_extern.createElement(
      type.head, cl.head, elem.r('id').head);
  newptr(elem, 'node').mod(app(r('div_get_node'), elem));

  extern(dom_extern.appendId(parent_id.head, node));
  return elem;
}

var mk_text = function(parent, str, mouseHandlers) {
  var pnode = call(parent.r('node'));
  var elem = mk('t');

  call(r('mk_elem'), parent.r('id'), elem,
      mk('div'), mk('str'));
  var node = call(elem.r('node'));

  //newptr(elem, 'id').mod(call(r('fresh_name')));
  var text_node = extern(dom_extern.createText(node, str.head));
  if (mouseHandlers) {
    call(r('add_mouse'), elem, mouseHandlers);
  }
}

var add_mouse = function(elem, handlers) {
  var node = call(elem.r('node'));
  var left = function(ev) {
    mk('frame');
    call(handlers.r('left'), elem);
  }
  var right = function(ev) {
    mk('frame');
    call(handlers.r('right'), elem);
  }
  dom_extern.addMouse(node,
      { left: left,
        right: right,
      });
}

var add_key = function(elem, handler) {
  var node = call(elem.r('node'));
  var press = function(char) {
    mk('frame');
    call(handler, elem, mk(char));
  }
  dom_extern.addKey(node, press);
}


module.exports = {
  init: ['mk_dom_constants'],

  exports: {
    mk_dom_constants: mk_dom_constants,
    fresh_name: fresh_name,

    div_mouse_over: div_mouse_over,
    div_mouse_out: div_mouse_out,
    div_get_node: div_get_node,

    mk_elem: mk_elem,
    mk_text: mk_text,

    add_mouse: add_mouse,
    add_key: add_key,
  },
}
