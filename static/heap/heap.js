T = {}
T.ptr  = 'ptr';
T.ptr_root = 'ptr-root';
T.ptr_edit = 'ptr-edit';
T.ptr_del = 'ptr-del';
T.data = 'data';
T.fn   = 'fn';
T.fn_call = 'fn-call';

Env = function() {
  this.count = 0;
  this.heap = [];
}
Env.prototype = {

  look: function(ref) {
    return this.heap[ref];
  },

  lookv: function(ref) {
    return this.look(ref).val;
  },

  add: function(cause, obj) {
    var ref = this.count;
    var val = { cause : cause, val : obj };
    this.heap[ref] = val;
    this.count += 1;
    return ref;
  },

  serialize: function() {
    return JSON.stringify(self.heap);
  },

  sref: function(ref) {
    return JSON.stringify([ref, this.look(ref)]);
  }
}

World = function() {
  // The Log
  this.log = new Env();

  // This holds data objects
  this.data = {};

  // This is a data object
  var root_obj = {head: 'root'};
  this.current_cause = undefined;
  // Cause will be undefined; see below
  var root_ref = this.add(root_obj);
  this.root = {
    head: root_obj.head,
    ref: root_ref,
    names: {},
    l: function(name) {
      return this.names[name];
    },
    r: function(name) {
      return this.names[name].l();
    },
  };
  // Causes are generally function refs; initial cause is root ref
  this.current_cause = root_ref;
  // Self-justification :/
  this.log.look(root_ref).cause = root_ref;

}

World.prototype = {

  // Log: 1 member
  add: function(obj) {
    return this.log.add(this.current_cause, obj);
  },

  // Object reference: 3 members
  lookd: function(ref) {
    return this.data[ref];
  },
  lookv: function(ref) {
    return this.data[ref].head;
  },
  l: function(name) {
    return this.root.l(name);
  },
  r: function(name) {
    return this.root.r(name);
  },

  // Ptrs: 3 members
  newptr: function(data, name) {
    var lptr = {
      type: T.ptr_root,
      base: data.ref,
      name: name
    };

    var w = this;

    var rptr = {
      unptr: w.add(lptr),
      l: function() { 
        return w.lookd(w.log.lookv(rptr.unptr).val);
      },
      mod: function(val) {
        return w.modptr(this, val);
      },
    };

    data.names[name] = rptr;

    return rptr;
  },

  intro_ptr: function(name) {
    return this.newptr(this.root, name);
  },

  modptr: function(ptr, data) {
    var mod = {
      type: T.ptr_edit,
      prior: ptr.unptr,
      val: data.ref,
    };

    ptr.unptr = this.add(mod);
    return ptr;
  },

  // Data: 2 members
  mkdata: function(head) {
    var data_ref = this.add({type: T.data, head: head});

    var data = {
      head: head,
      ref: data_ref,
      names: {},

      l: function(name) {
        return this.names[name];
      },
      r: function(name) {
        return this.names[name].l();
      },
    };

    this.data[data_ref] = data;

    return data;
  },
  mktup: function(head, fields) {
    var w = this;
    var data = w.mkdata(head);
    _.each(fields, function(pair) {
      w.newptr(data, pair[0]).mod(pair[1]);
    });
    return data;
  },

  // Functions: 3 members
  mkfn: function(jsfn) {
    var fn_str = '(' + jsfn.toString() + ')';
    var fn_ref = this.add({type: T.fn, val: fn_str});

    with(this) { 
      var fn_obj = eval(fn_str);
    }
    var data = {
      ref: fn_ref,
      fn: fn_obj
    };
    this.data[fn_ref] = data;
    return data;
  },

  calls: function(fn, args) {
    var call = {
      type: T.fn_call,
      fn: fn.ref,
      args: _.pluck(args, 'ref'),
    };
    // Log the call
    call_ref = this.add(call);
    //var fn_obj = this.lookd(fn_ref);
    var temp_cause = this.current_cause;
    this.current_cause = call_ref

    // Execute the call
    var result = fn.fn.apply(null, args);

    this.current_cause = temp_cause;
    return result;
  },

  call: function(fn, arg) {
    var call = {
      type: T.fn_call,
      fn: fn.ref,
      arg: arg.ref
    };
    // Log the call
    call_ref = this.add(call);
    //var fn_obj = this.lookd(fn_ref);
    var temp_cause = this.current_cause;
    this.current_cause = call_ref

    // Execute the call
    var result = fn.fn(arg);

    this.current_cause = temp_cause;
    return result;
  },

  // Resets run using log, ref as a timepoint
  // TODO delete
  //reset: function(ref) {
  //  var testbar = "(function() { return foo.val; })"
  //  var testbaz = "(function() { return bar() + 1; })"
  //  with(this.runtime) {
  //    this.runtime['bar'] = eval(testbar);
  //    this.runtime['baz'] = eval(testbaz);
  //  }
  //  console.log('bar: ', this.runtime.bar());
  //  console.log('baz: ', this.runtime.baz());
  //},
}

// Bootstrapping //
//nil_def = function() {
//  var nil = newrootptr('nil');
//  var val = add({ head: 'nil' });
//  modptr(nil, { 
//cons_def = function() {
//  var cons = newrootptr('cons');
//  newptr(cons, 'head');
//  newptr(cons, 'tail');
//};
//               //

var w = new World();
var pr = function() {
  _.each(w.log.heap, function(o, i) { console.log(i, o.cause, o.val); });
};

var init = function() {
  intro_ptr('nil').mod(mkdata('nil'));

  var zipper_add = function(self, data) {
    var z = self
    z.l('front').mod(mktup('cons', [['head', data], ['tail', z.r('front')]]));
  };
  // TODO delete
  //var zipper_add = function(data) {
  //  var z = data.r('zipper');
  //  z.l('front').mod(mktup('cons', [['head', data.r('data')], ['tail', z.r('front')]]));
  //};
  intro_ptr('zipper-add').mod(mkfn(zipper_add));

  var zipper = function(name_obj) {
    var n = name_obj.head;
    intro_ptr(n).mod(mkdata('zipper'));
    var z = r(n);
    newptr(z, 'front').mod(r('nil'));
    newptr(z, 'back').mod(r('nil'));
    newptr(z, 'add').mod(r('zipper-add'));
  }
  intro_ptr('zipper').mod(mkfn(zipper));
  intro_ptr('22').mod(mkdata('22'));

  call(r('zipper'), mkdata('z1'));

  calls(r('z1').r('add'), [r('z1'), r('22')]);
  //call(r('z1').r('add'), mktup('arg', [['zipper', r('z1')], ['data', r('22')]]));
}

var _null = w.mkdata('null');
var init= w.intro_ptr('init').mod(w.mkfn(init)).l();
w.call(init, _null);

pr();

//var r22 = w.mkdata(22);
//var r1  = w.mkdata(1);
//var n = w.mkdata('null');
//
//var root_ptr = w.intro_ptr('tree');
//w.modptr(root_ptr, w.mkdata('Branch'));
//var lp = w.newptr(w.r('tree'), 'left');
//var rp = w.newptr(w.r('tree'), 'right');
//w.modptr(lp, w.mkdata('leaf'));
//w.modptr(w.r('tree').l('right'), w.mkdata(22));
//
//var tr_fn = w.intro_ptr('mktree');
//var tr_fn_ref = w.mkfn(function(name) {
//  var n = name.head;
//  intro_ptr(n);
//  modptr(l(n), mkdata('Branch'));
//  newptr(r(n), 'left');
//  newptr(r(n), 'right');
//});
//w.modptr(w.l('mktree'), tr_fn_ref);
//result = w.call(w.r('mktree').ref, w.mkdata('my-tree'));


//var fn_ref = w.mkfn(function(x) {
//  return mkdata(x.head*22);
//});


