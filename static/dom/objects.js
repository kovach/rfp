var _ = require('underscore');
var util = require('../util/util.js');
var o = require('../base/objects.js');

var mk_constants = function() {
  rptr('li').mod(mk('li'));
  rptr('div').mod(mk('div'));
  rptr('log-entry').mod(mk('log-entry'));
  rptr('log-token').mod(mk('log-token'));
  rptr('id').mod(mk('id'));
}

var mk_div = function() {
  var div = mk('div');
  call(r('init_obj'), div);
  return div;
}


module.exports = {
  exports: {
    mk_constants: mk_constants,
    mk_div: mk_div,
  },
}
