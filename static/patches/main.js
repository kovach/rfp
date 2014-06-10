var _   = require('underscore');
w   = require('../heap/heap.js');
util = require('../util/util.js');

var base    = require('../base/objects.js');
var dom     = require('../dom/objects.js');
var patches = require('../patches/objects.js');

var dom_extern = require ('../dom-util.js');

var current_time = 0;
var print_update = function() {
  c.log.print_from(current_time);
  current_time = c.log.time;
}
p = print_update;

nc = undefined;
var global_mk_stepper = function(ref) {
  if (nc) {
    nc.dependent.replay();
    var node = nc.call(nc.r('stepper').r('node'));
    if (node !== null) {
      dom_extern.removeElement(node);
    }
    nc = undefined;
  }
  if (nc === undefined) {
    nc = new w.context(globals, c);
    nc.replay();
    nc.dependent = c;
    c.update_cursor();
    c.rewind(ref);

    // Make stepper with new context
    nc.rptr('stepper').mod(nc.call(nc.r('mk_stepper')));
  }
  //nc.call(nc.r('log_frame'), nc.r('stepper'), nc.mk(c.cursor));
}

var globals = {
  global: 22,
  dom_extern: dom_extern,
  global_mk_stepper: global_mk_stepper,
};


c = new w.context(globals);
//cr1 = c.mk_cursor(c.log.time);

var init_context = function(c) {
  util.load_exports(c, base);
  util.load_exports(c, dom);
  util.load_exports(c, patches);
}
var mk_test = function() {

  //util.load_exports(c, base);
  //util.load_exports(c, dom);
  //util.load_exports(c, patches);

  // Make help box in separate context
  var help_context = new w.context(globals);


  init_context(c);
  init_context(help_context);

  //help_context.call(help_context.r('mk_help'));
  c.call(c.r('mk_help'));

  // Make editor in main context
  c.rptr('ed').mod(c.call(c.r('mk_line')));

  print_update();
}

module.exports = {
  //init: ['mk_test'],
  exports: {
    mk_test: mk_test,
  },
  dom_extern: dom_extern,
}

util.load_exports(c, module.exports);

mk_test();
