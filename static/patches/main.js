var _   = require('underscore');
w   = require('../heap/heap.js');
util = require('../util/util.js');

var p   = require('../patches/objects.js');
dom = require('../dom/objects.js');

c = new w.context();

o1 = {x: 0, y: 1};
o2 = {a: 0, b: 1};
util.merge_obj(o1, o2);

util.load_exports(c, p);
util.load_exports(c, dom);
