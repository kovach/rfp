var _ = require('underscore');

var merge_obj = function(to, from) {
  _.each(from, function(val, key) {
    to[key] = val;
  });
}

var load_exports = function(c, mod) {
  _.each(mod.exports, function(val, key) {
    c.rptr(key).mod(c.mkfn(val));
  });
}

module.exports = {
  merge_obj: merge_obj,
    load_exports: load_exports,
}
