// TODO
T = {}
T.ptr_root = 'ptr-root';
T.ptr_edit = 'ptr-edit';
T.data = 'data';
T.fn   = 'fn';
T.fn_call = 'fn-call';
T.fn_app = 'fn-app';
/*
"Type Def":
each has a type field
ptr_root { base: ref, name: str }
ptr_edit { prior: ref, val: ref }
data { head: str }
fn { fn: str }
call { fn: ref, args: [ref] }
 */

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

  add: function(pair) {
    var ref = this.count;
    var val = { cause : pair.cause, val : pair.val };
    this.heap[ref] = val;
    this.count += 1;
    return ref;
  },

  serialize: function() {
    return JSON.stringify(this.heap);
  },

  serialize_range: function(begin, end) {
    var result = [];
    for (var i = begin; i <= end; i++) {
      result.push([i, this.heap.log[i]]);
    }
    return JSON.stringify(result);
  },

  parse: function(str) {
    this.heap = JSON.parse(str);
    this.count = this.heap.length;
  },

  sref: function(ref) {
    return JSON.stringify([ref, this.look(ref)]);
  },

  print: function() {
    _.each(this.heap, function(o, i) {
      console.log(i, o.cause.ref, o.cause.count, o.val); });
  },
}

World = function() {
  // The Log
  this.log = new Env();
  this.time = this.log.count;

  // This holds data objects
  this.data = {};
  // This holds pointers for efficient update from log
  this.ptrs = {};

  // This is a data object
  //var root_obj = {head: 'root'};
  this.current_cause = {};

  // Cause will be undefined; see below
  var root_obj = this.mk('root');
  this.root = root_obj;
  // Causes are generally function refs; initial cause is root ref
  var root_ref = root_obj.ref;
  this.current_cause = {ref: root_ref, count: 0};
  // Self-justification :/
  this.log.look(root_ref).cause = {ref: root_ref, count: 0};

}

World.prototype = {

  // Log: 1 member
  add: function(obj) {
    var cause = this.current_cause
    var ref = this.log.add({
      cause: {ref: cause.ref, count: cause.count},
      val: obj});
    this.current_cause.count++;
    this.time = ref;
    return ref;
  },

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

  do_newptr: function(ref, entry) {
    var w = this;

    var ptr_obj = {
      pref: ref,
      dref: undefined, // No initial value; set by modptr
      r: function() { 
        //return w.lookd(w.log.lookv(this.unptr).val);
        return w.lookd(this.dref);
      },
      mod: function(val) {
        return w.modptr(this, val);
      },
    };
    this.data[entry.base].names[entry.name] = ptr_obj;
    this.ptrs[ref] = ptr_obj;

    return ptr_obj;
  },
  newptr: function(data, name) {
    var entry = {
      type: T.ptr_root,
      base: data.ref,
      name: name
    };
    var ref = this.add(entry);

    return this.do_newptr(ref, entry);
  },

  rptr: function(name) {
    return this.newptr(this.root, name);
  },

  do_modptr: function(ref, entry) {
    var ptr_obj = this.ptrs[entry.prior];
    ptr_obj.pref = ref;
    ptr_obj.dref = entry.val;
    // Update at new pref
    this.ptrs[ref] = ptr_obj;
    return ptr_obj;
  },

  modptr: function(ptr, data) {
    var entry = {
      type: T.ptr_edit,
      prior: ptr.pref,
      val: data.ref,
    };
    var ref = this.add(entry)
    return this.do_modptr(ref, entry);
  },

  // Data: 2 members
  do_mk: function(ref, entry) {
    var data = {
      head: entry.head,
      ref: ref,
      names: {},

      l: function(name) {
        return this.names[name];
      },
      r: function(name) {
        return this.names[name].r();
      },
    };

    this.data[ref] = data;

    return data;
  },
  mk: function(head) {
    var entry = {type: T.data, head: head};
    var ref = this.add(entry);

    return this.do_mk(ref, entry);

  },
  mktup: function(head, fields) {
    var w = this;
    var data = w.mk(head);
    _.each(fields, function(val, key) {
      w.newptr(data, key).mod(val);
    });
    return data;
  },

  // Functions: 3 members
  do_mkfn: function(ref, entry) {
    with(this) { 
      var fn_obj = eval(entry.fn);
    }
    var data = {
      ref: ref,
      fn: fn_obj,
      args: [],
    };
    this.data[ref] = data;
    return data;
  },
  mkfn: function(jsfn) {
    var fn_str = '(' + jsfn.toString() + ')';
    var entry = {
      type: T.fn,
      fn: fn_str
    };
    var ref = this.add(entry);

    return this.do_mkfn(ref, entry);
  },

  app: function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var entry = {
      type: T.fn_app,
      fn: fn.ref,
      args: _.pluck(args, 'ref'),
    };
    app_ref = this.add(entry);

    var closure = {
      ref: app_ref,
      fn: fn.fn,
      args: fn.args.concat(args),
    };

    return closure;
  },
  call: function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var entry = {
      type: T.fn_call,
      fn: fn.ref,
      args: _.pluck(args, 'ref'),
    };
    // Log the call
    call_ref = this.add(entry);
    //var fn_obj = this.lookd(fn_ref);
    var temp_cause = this.current_cause;
    this.current_cause = {ref: call_ref, count: 0};

    // Execute the call
    var result = fn.fn.apply(null, fn.args.concat(args));

    this.current_cause = temp_cause;
    return result;
  },

  do_op: function(ind, pair) {
    var w = this;
    var entry = pair.val;

    switch (entry.type) {
      case T.ptr_root:
        w.do_newptr(ind, entry);
        break;
      case T.ptr_edit:
        w.do_modptr(ind, entry);
        break;
      case T.data:
        w.do_mk(ind, entry);
        break;
      case T.fn:
        w.do_mkfn(ind, entry);
        break;
      default:
        break;
    }
    w.log.heap[ind] = pair;
  },
  load: function(world) {
    return this.loadrange(world, 0, this.log.count);
  },
  loadrange: function(world, start, end) {
    var w = this;
    for (var ind = start; ind <= end; ind++) {
      var pair = world.log.heap[ind];
      w.do_op(ind, pair);
    }
  },

  rollback: function(time) {
    for (var i = this.time; i >= time; i--) {
      var entry = this.log.look(i);
      switch(entry.val.type) {
      }
    }
  },

}

