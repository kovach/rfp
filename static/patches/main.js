var _   = require('underscore');
w   = require('../heap/heap.js');
util = require('../util/util.js');

base    = require('../base/objects.js');
dom     = require('../dom/objects.js');
patches = require('../patches/objects.js');

dom_extern = require ('../dom-util.js');


var current_time = 0;
print_update = function() {
  c.log.print_from(current_time);
  current_time = c.log.time;
}
p = print_update;

c = new w.context();
mk_test = function() {

  util.load_exports(c, base);
  util.load_exports(c, dom);
  util.load_exports(c, patches);

  c.call(c.r('mk_line'));
  c.call(c.r('mk_line'));

  //var elem = c.call(c.r('mk_elem'), c.mk('div'), c.mk('p-text'));
  //var node = c.call(elem.r('node'));
  //dom_extern.appendDoc(node);
  //c.rptr('elem1').mod(elem);
  //c.call(c.r('mk_box'), elem);
  //c.call(c.r('mk_text'), elem, mk('hello world.'));

  print_update();
}

module.exports = {
  init: ['mk_test'],
  exports: {
    mk_test: mk_test
  },
}

util.load_exports(c, module.exports);
