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

TODO:
 - need to version game descriptions
 - 

 */
/*
 



*/

Ptr = {}
Ptr.root = 'root'
Ptr.edit = 'edit'
Ptr.base_root = 'root'

Cause = {};
Cause.root = 'root';
Cause.init = 'init';

W = {}
W.env = { count : 0, heap : [] }

// Add with cause
W.add = function(obj) {
  var id = W.env.count;
  var val = { cause : W.current, val : obj };
  W.env.heap[id] = val;
  W.env.count += 1;
  return id;
}

W.current = Cause.root

W.send = function(obj, msg) {
  var current = W.current;
  W.current = W.add(msg);
  var out = obj.handle(msg);
  W.current = current;
  // TODO eliminate this?
  return out;
}
W.init = function(obj) {
  var or = W.add(obj);
  var op = mkp(Ptr.base_root, obj.name);
  obj.handle = function(msg) {
    _.each(obj.handlers, function(h) { h(msg); });
  }
  obj.handlers = [];

  return { ref : or, ptr : op };
}
W.addH = function(obj, hook) {
  obj.handlers.push(hook);
}
W.addL = function(obj, label, hook) {
  obj.handlers.push(function(msg) {
    if (msg.label === label) {
      return hook(msg);
    }
  });
}


W.look = function(id) { 
  return W.env.heap[id];
}
look = W.look
W.lookv = function(id) { 
  return look(id).val;
}
lookv = W.lookv

lookpv = function(ptr) {
  return lookv(lookp(ptr));
}
lookp = function(ptr) {
  var pval = lookv(ptr.unptr);
  if (pval.type === Ptr.root) {
    console.log('error lookp. root');
  } else {
    return pval.ref;
  }
}

// Optimization:
// Returns pointer
getr = function(id, r) {
  return lookv(id).fields[r];
}

// "Pointers"
mkp = function(base, name) {
  // r for root
  var ptr =
    { type : Ptr.root
    , base : base
    , name : name
    };

  return { unptr : W.add(ptr) };
}
modp = function(ptr, ref) {
  var mod =
    { type : Ptr.edit
    , prior : ptr.val
    , ref : ref
    }

  // Optimization
  ptr.unptr = W.add(mod);
}
constrs = function(type, head) {
  var t = lookv(type);
  if (t.constrs) {
    return t.constrs[head];
  } else {
    // e.g. Num
    return [];
  }
}
mkdata = function(val) {
  var dataref = W.add(val);
  // Optimization:
  var pmap = {};

  _.each(constrs(val.type, val.head), function(field) {
    // Make Locations for fields
    var obj = mkp(dataref, field);
    pmap[field] = obj;
  });

  // Optimization:
  lookv(dataref).fields = pmap;

  return dataref;
}

// Types
// Make list type
//
t_list = W.add(
  { name : 'list'
  , constrs :
    { nil : []
    , cons : ['head', 'tail']
    }
  });
t_num = W.add(
  { name : 'num'
  });
t_char = W.add(
  { name : 'char'
  });
//
//
//

mktdata = function(type, head) {
  var v = { type : type
          , head : head
          }
  return mkdata(v);
}

nil = function() {
  return mktdata(t_list, 'nil');
}
cons_ = function() {
  return mktdata(t_list, 'cons');
}
cons = function(head, tail) {
  var c = cons_();
  modp(getr(c, 'head'), head);
  modp(getr(c, 'tail'), tail);
  return c;
}
num = function(n) {
  return mktdata(t_num, n);
}


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
  z.name = name;

  var rs = W.init(z);
  var zp = rs.ptr;

  z.front = mkp(zp, 'front');
  z.back  = mkp(zp, 'back');
  modp(z.front, nil());
  modp(z.back, nil());

  z.left = function() {
  }
  z.add = function(ref) {
    modp(z.front, cons(ref, lookp(z.front)));
  }
  z.toList = function() {
    return z.toList$(z.front);
  }
  z.toList$ = function(ptr) {
    var obj = lookpv(ptr);
    if (obj.head === 'nil') {
      console.log('[]');
    } else {
      var h = lookpv(obj.fields['head']);
      console.log(h);
      z.toList$(obj.fields['tail'])
    }
  }

  W.addL(z, 'add', function(msg) {
    z.add(msg.ref);
  });
  W.addL(z, 'print', function() {
    z.toList();
  });
}

manager = function(name) {
  var m = this;
  m.name = name;
  W.init(m);

  m.objects = [];

  W.addH(m, function(msg) {
    switch (msg.label) {
      case 'zipper':
        var z = new zipper(msg.name);
        m.objects.push(z);
        return z;
        break;
    }
  });
}
MSG = function(label) {
  return { label : label };
}

M = new manager("M");
W.send(M, { label : 'zipper', name : 'z1' });
z1 = M.objects[0];

n1 = num(22);
n2 = num(23);

W.send(z1, { label : 'add', ref : n1 });
W.send(z1, { label : 'add', ref : n2 });
W.send(z1, { label : 'print' });
