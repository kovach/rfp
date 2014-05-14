// TODO
// change calls to use arguments array, remove call?
T = {}
T.ptr_root = 'ptr-root';
T.ptr_edit = 'ptr-edit';
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
    return JSON.stringify(this.heap);
  },

  parse: function(str) {
    this.heap = JSON.parse(str);
    this.count = this.heap.length;
  },

  sref: function(ref) {
    return JSON.stringify([ref, this.look(ref)]);
  }
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
    var ref = this.log.add({ref: cause.ref, count: cause.count}, obj);
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
      l: function() { 
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
        return this.names[name].l();
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
    _.each(fields, function(pair) {
      w.newptr(data, pair[0]).mod(pair[1]);
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
      fn: fn_obj
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
    this.current_cause = {ref: call_ref, count: 0};

    // Execute the call
    var result = fn.fn.apply(null, args);

    this.current_cause = temp_cause;
    return result;
  },

  // TODO remove this?
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
    this.current_cause = {ref: call_ref, count: 0}

    // Execute the call
    var result = fn.fn(arg);

    this.current_cause = temp_cause;
    return result;
  },

  load: function(world) {
    var w = this;
    _.each(world.log.heap, function(pair, ind) {
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
          return;
      }
      // TODO better abstraction
      w.log.heap[ind] = pair
    });
  },


  rollback: function(time) {
    for (var i = this.time; i >= time; i--) {
      var entry = this.log.look(i);
      switch(entry.val.type) {
      }
    }
  },

}

