var _ = require('underscore');
var util = require('../util/util.js');
var o = require('../base/objects.js');

var dom_extern = require ('../dom-util.js');

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
var mk_elem = function(type, cl) {
  var elem = call(r('init_obj'), mk('elem'));
  newptr(elem, 'id').mod(call(r('fresh_name')));
  var node = dom_extern.createElement(
      type.head, cl.head, elem.r('id').head);
  newptr(elem, 'node').mod(app(r('div_get_node'), elem));

  dom_extern.appendDoc(node);
  return elem;
}
var mk_box = function(parent) {
  var div = call(r('init_obj'), mk('div'));

  newptr(div, 'id').mod(call(r('fresh_name')));

  // TODO extern log entry?
  var node = dom_extern.createDiv(
      call(parent.r('node')), 'box-div', div.r('id').head);

  newptr(div, 'node').mod(app(r('div_get_node'), div));
  newptr(div, 'mouse-over').mod(r('div_mouse_over'));
  newptr(div, 'mouse-out').mod(r('div_mouse_out'));
}
var mk_text = function(parent, str) {
  var node = call(parent.r('node'));
  _.each(str.head, function(c) {
    dom_extern.createText(node, c);
  });
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
    mk_box: mk_box,
    mk_text: mk_text,
  },
}
