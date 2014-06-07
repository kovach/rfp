d = require('./lang/denotation.js');

c1 = new d.context();
cons = c1.mk('cons');
c1.newptr(cons, 'head');
c1.newptr(c1.cursor(), 'foo');
