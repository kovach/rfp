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

addmsg = function(cause, msg) {
  add({ cause : cause,  msg : msg });
}

look = function(id) { 
  return env.heap[id];
}
l = look;

lookv = function(ptr) {
  return look(lookp(ptr)).val;
}
lookp = function(ptr) {
  return look(ptr.val).ref;
}
// TODO
//lookp = function(id, time) {
//  return findLast(id, time);
//}
//findLast = function(xs, time) {
//  while (xs > time) {
//    xs = look(xs).prior;
//  }
//  return look(xs).ref;
//}

// Optimization:
// Returns pointer
getr = function(id, r) {
  return look(id).val.fields[r];
}

// "Pointers"
mkp = function(root, name) {
  // r for root
  var p = { type : '_r', root : root, name : name };
  var pobj = { val : add(p) };
  return pobj;
}
modp = function(ptr, ref) {
  var mod =
    { prior : ptr.val
    , ref : ref
    , type : '_e' // e for edit
    }

  ptr.val = add(mod);
}
constrs = function(type, head) {
  var t = look(type);
  if (t.constrs) {
    return t.constrs[head];
  } else {
    // Supports external types
    return [];
  }
}
mkdata = function(cause, val) {
  var dataref = add({ cause : cause
                    , val : val
                    });
  // Optimization:
  var pmap = {};

  _.each(constrs(val.type, val.head), function(field) {
    // Make Locations for fields
    var obj = mkp(dataref, field);
    pmap[field] = obj;
  });

  // Optimization:
  look(dataref).val.fields = pmap;

  return dataref;
}
modval = function(ptr, cause, val) {
  return modp(ptr, mkdata(cause, val));
}

// Make list type
t_list = add(
  { name : 'list'
  , constrs :
    { nil : []
    , cons : ['head', 'tail']
    }
  });
t_num = add(
  { name : 'num'
  });

mktdata = function(cause, type, head) {
  var v = { type : type
          , head : head
          }
  return mkdata(cause, v);
}

nil = function(cause) {
  return mktdata(cause, t_list, 'nil');
}
cons = function(cause) {
  return mktdata(cause, t_list, 'cons');
}
num = function(cause, n) {
  return mktdata(cause, t_num, n);
}

cause = {};
cause.root = 'root';
cause.init = 'init';
r = cause.root;
pointers = {};
pointers.root = 'proot';

//p1 = mkp('none', 'x');
//c1 = cons(r);
//modp(p1, c1);
//h1 = getr(c1, 'head');
//n1 = nil(r);
//n2 = num(r, 22)
//n3 = num(r, 23)
//u1 = function() {modp(getr(c1, 'tail'), n1);}
//u2 = function() {modp(getr(c1, 'head'), n2);}
//u1(); u2();
//modp(h1, n3);

zipper = function(name) {

  var z = this;
  var zr = add(z);
  var zp = mkp(pointers.root, name);
  z.cause = 'zipper';
  z.ptr = zp;

  z.front = mkp(zp, 'front');
  z.back  = mkp(zp, 'back');
  modp(z.front, nil(z.cause));
  modp(z.back, nil(z.cause));
  // nil, nil

  z.left = function() {
    // TODO
  }
  z.add = function(ref) {
    var cause = addmsg('add', { val : ref });
    var c = cons(cause);
    modp(getr(c, 'head'), ref);
    modp(getr(c, 'tail'), lookp(z.front));
    modp(z.front, c);
  }
  z.toList = function() {
    return z.toList$(z.front);
  }
  z.toList$ = function(ref) {
    var obj = lookv(ref);
    if (obj.head === 'nil') {
      console.log('[]');
    } else {
      var h = lookv(obj.fields['head']);
      console.log(h);
      z.toList$(obj.fields['tail'])
    }
  }
}
z1 = new zipper("a-zipper");
n1 = num(r, 22);
n2 = num(r, 23);
z1.add(n1);
z1.add(n2);
z1.toList();

//z1 = new zipper();
//p1 = mkp(undefined);
//o1 = num(p1, cause.root, 22);
//modp(p1, o1);


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
