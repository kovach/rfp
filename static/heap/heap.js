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

  // Object reference: 2 member
  lookd: function(ref) {
    return this.data[ref];
  },
  lookv: function(ref) {
    return this.data[ref].head;
  },

  // Ptrs: 3 members
  newptr: function(data, name) {
    var lptr = {
      type: T.ptr_root,
      base: data.ref,
      name: name
    };

    var rptr = {
      unptr: this.add(lptr)
    };

    data.names[name] = rptr;

    return rptr;
  },

  intro_ptr: function(name) {
    return this.newptr(this.root, name);
  },

  modptr: function(ptr, data_ref) {
    var mod = {
      type: T.ptr_edit,
      prior: ptr.unptr,
      val: data_ref,
    };

    ptr.unptr = this.add(mod);
  },

  // Data: 1 member
  mkdata: function(head) {
    var data_ref = this.add({type: T.data, head: head});

    this.data[data_ref] = {head: head, ref: data_ref, names: {}};

    return data_ref;
  },

  // Functions: 3 members
  mkfn: function(jsfn) {
    var fn_str = '(' + jsfn.toString() + ')';
    var fn_ref = this.add({type: T.fn, val: fn_str});

    with(this.root.names) { 
      var fn_obj = eval(fn_str);
    }
    this.data[fn_ref] = {ref: fn_ref, fn: fn_obj};
    return fn_ref;
  },

  mkcall: function(fn_ref, arg_ref) {
    var call = {
      type: T.fn_call,
      fn: fn_ref,
      arg: arg_ref
    };

    return this.add(call);
  },

  call: function(fn_ref, arg_ref) {
    var fn_obj = this.lookd(fn_ref);
    var temp_cause = this.current_cause;
    // Log the call
    this.current_cause = this.mkcall(fn_ref, arg_ref);
    // Execute  the call
    var result = fn_obj.fn(this.lookv(arg_ref));
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

var r22 = w.mkdata(22);
var r1  = w.mkdata(1);
var n = w.mkdata('null');

//var p_mkdata = w.intro_ptr('mkdata');
//w.modptr(p_mkdata, w.mkfn(w.mkdata));
//
var fn_ref = w.mkfn(function(x) {
  return w.mkdata(x*22);
});
var nil = w.mkfn(function() {
  return w.mkdata('nil');
});
var mkpair = w.mkfn(function() {
  var pair = mkdata('pair');
  newptr(pair, 'fst');
  newptr(pair, 'snd');

  return pair;
});

w.call(fn_ref, r22);
//w.call(mkpair, n);


_.each(w.log.heap, function(o, i) { console.log(i, o.cause, o.val); });
