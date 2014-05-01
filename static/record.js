/*
1.
q((s, r), dr) -> s
cost proportional to min( dr*ds, s(r+dr) )

s(r) = denote(log(heap))

2.
content of one message log entry
 1. generic:
   - ref to game id
     - ref to game description
     - ref to game state root
   - move content
   - ref to cause (= move; implement morphisms as special class of games)

 2. heap:
   - move content
     - edit
       - ref to previous value
       - ref to new value content
   - ref to cause (justifying move)

 3. game creation:
   - initiates game state root
   - future log can reference new game id

 */

i = _.uniqueId
none = 'none'
env = { count : 0, heap : [] }
add = function(obj) {
  var id = env.count;
  env.heap[id] = obj;
  env.count += 1;
  return id;
}

addmsg = function(msg, cause) {
  add({ cause : cause,  msg : msg });
}

look = function(id) { 
  var val = env.heap[id];
  return val;
}
l = look;
alive = function(time) {
  return function(ref) {
    return ref <= time;
  }
}

lookcv = function(id) {
  return look(lookc(id)).val;
}
lookp = function(id, time) {
  return look(findLast(look(id).val, alive(time)));
}
lookc = function(id) {
  var obj = look(id);
  if (obj.current) {
    return obj.current;
  } else {
    return look(id).ref;
  }
}
lookp = function(id, time) {
  return findLast2(id, time);
}
findLast = function(xs, time) {
  while (xs > time) {
    xs = look(xs).prior;
  }
  return look(xs).ref;
}

// returns pointer
getr = function(id, r) {
  return look(id).rs[r];
}

p = function(root) {
  return { type : '_pointer', root : root };
}
mkp = function(root) {
  var ref = add(p(root));
  // used by modp
  p.val = ref;
  return ref;
}
//modp = function(ptr, ref) {
//  look(ptr).val.push(ref);
//}
modp = function(ptr, ref) {
  var r = root(ptr);
  var current = lookc(r);

  var newr = mkmod(current, ref);
  look(r).current = newr;
  return newr;
}
mkmod = function(m1, ref) {
  var m2 = { prior : m1
           , ref : ref
           , type : '_mod'
           }
  return add(m2);
}

mkd2 = function(prior, cause, val) {
  var newref = add({ cause : cause
                   , val : val
                   });
  var rsm = {};
  _.each(val.rs, function(r) {
    var ref = mkp(newref);
    rsm[r] = ref;
  });

  look(newref).rs = rsm;

  return modp(prior, newref);
}

//mkd = function(prior, cause, type, val, rs) {
//  var newref = add({ cause : cause
//    , type : type , val : val
//  });
//  var rsm = {};
//  _.each(rs, function(r) {
//    var ref = mkp(newref);
//    rsm[r] = ref;
//  });
//
//  look(newref).rs = rsm;
//
//  return modp(prior, newref);
//}

nil = function(ref, cause) {
  return mkd2(ref, cause, { type : 'list'
                          , head : 'nil'
                          , rs : []
                          });
}
cons = function(ref, cause) {
  return mkd2(ref, cause, { type : 'list', head : 'cons', rs : ['head', 'tail'] });
}
num = function(ref, cause, n) {
  return mkd2(ref, cause, { type : 'num', head : n, rs : []});
}

cause = {};
cause.root = 'root';
cause.init = 'init';

zipper = function() {

  var z = this;
  var zp = add(z);

  z.front = mkp(zp);
  z.back  = mkp(zp);
  nil(z.front, cause.init);
  nil(z.back , cause.init);

  z.left = function() {
    if (lookcv(z.front).head === 'nil') {
      return
    }
    // TODO
  }
  z.add = function(ref) {
    var f = lookc(z.front);
    var cause = addmsg('add', zp);

    cons(z.front, cause);
    modp(lookcv(z.front)['head'], ref);
    modp(lookcv(z.front)['head'], f);
  }
  z.toList = function() {
    return z.toList$(z.front);
  }
  z.toList$ = function(ref) {
    var obj = lookcv(ref);
    if (obj.head === 'nil') {
      return
    } else {
      var h = lookcv(obj.rs['head']);
      console.log(h);
      z.toList$(obj.rs['tail'])
    }
  }
}

z1 = new zipper();
p1 = mkp(undefined);
o1 = num(p1, cause.root, 22);
modp(p1, o1);


// old tests
//var root = cause.root
//var l1 = {_head : 'cons', head : { _head : 22}, tail : { _head : 'cons', head : { _head : 1 }, tail : { _head : 'nil' }}};
//var p1 = mkp();
//var front = cons(p1, root);
//var n1 = num(getr(front, 'head'), root, 22);
//nil(getr(cons(getr(front, 'tail')), 'tail'), root);
////nil(getr(front, 'tail'));
//var n2 = num(getr(front, 'head'), root, 2);


// value
//b0 = add(
//  { type : 'new'
//  , val  : true
//  });
//
//// initial state
//s0 = add(b0);
//
//// game type
//flipper = add(
//  { flip :
//    function(msg) {
//      var b = read('state');
//      set('state', !b);
//    }
//  });
//
//    
//g0 = add(
//  { state : s0
//  , def   : flipper
//  });
//
//m0 =
//{ move : 'flip'
//, game : g0
//, cause : none
//}
