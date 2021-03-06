var _ = require('underscore');
var util = require('../util/util.js');

T = {}
T.ptr_root = 'ptr-root';
T.ptr_edit = 'ptr-edit';
T.data = 'data';
T.fn   = 'fn';
T.fn_call = 'fn-call';
T.fn_app = 'fn-app';
T.extern = 'ext';
/*
"Type Def":
each has a type field
ptr_root { base: ref, name: str }
ptr_edit { prior: ref, val: ref }
data { head: str }
fn { fn: str }
call { fn: ref, args: [ref] }
app  { fn: ref, args: [ref] }
 */

var log = function() {
  this.time = 0;
  this.heap = [];
}
log.prototype = {

  look: function(ref) {
    return this.heap[ref];
  },
  set: function(ref, val) {
    this.heap[ref] = val;
  },

  lookv: function(ref) {
    return this.look(ref).val;
  },

  add: function(pair) {
    var ref = this.time;
    //var val = { cause : pair.cause, val : pair.val };
    //this.heap[ref] = val;
    this.heap[ref] = pair;
    this.time += 1;
    return ref;
  },

  copy_cause: function(cause) {
    return {ref: cause.ref, count: cause.count};
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
    this.time = this.heap.length;
  },
  copy: function() {
    var l = new log();
    l.heap = JSON.parse(this.serialize());
    l.time = this.time;
    return l;
  },

  sref: function(ref) {
    return JSON.stringify([ref, this.look(ref)]);
  },

  print: function() {
    _.each(this.heap, function(o, i) {
      console.log(i, o.cause.ref, o.cause.count, o.val); });
  },

  print_from: function(time) {
    for (var i = time; i < this.time; i++) {
      var o = this.heap[i];
      console.log(i, o.cause.ref, o.cause.count, o.val);
    }
  },
}

var context = function(globals, other_context) {
  var w = this;

  // External imports
  this.globals = globals;
  util.merge_obj(w, globals);

  // The Log
  w.log = new log();
  w.current_cause = {};

  // This holds data objects
  this.data = {};
  // This holds pointers for efficient update from log
  this.ptrs = {};


  // For time manipulation
  w.cursor_log = new log();

  w.mkroot();
  w.cursor = w.log.time;

  // Load other log
  if (other_context) {
    console.log('LOADING');
    w.log = other_context.log.copy();
    w.cursor = 1;
  }

  // For Replays
  w.replay_time = undefined;

  // TODO delete
  // Cause will be undefined; see below
  //var root_obj = this.mk('root');
  //this.root = root_obj;
  //// Causes are generally function refs; initial cause is root ref
  //var root_ref = root_obj.ref;
  //this.current_cause = {ref: root_ref, count: 0};
  //// Self-justification :/
  //this.log.look(root_ref).cause = {ref: root_ref, count: 0};

}

context.prototype = {

  //load: function(root, other_log) {
  //  var w = this;
  //  w.root = root;
  //  w.current_cause = {ref: root.ref, count: 1};
  //  _.each(other_log.heap, function(entry, ind) {
  //    w.log.add(entry);
  //    w.do_op(ind, entry);
  //  });
  //},

  update_cursor: function() {
    this.cursor = this.log.time;
  },
  match_obj: function(ref, head) {
    var obj = this.lookd(ref);
    if (obj && obj.head === head) {
      return true;
    }
    return false;
  },
  step_cursor: function() {
    //console.log('step: ', c);
    this.do_op(this.cursor, this.lookr(this.cursor));
    this.cursor++;
  },
  forward: function() {
    var c = this.cursor;
    if (c < this.log.time) {
      this.step_cursor();
    } else {
      console.log('forward. end');
    }
  },
  forward_frame: function() {
    // TODO delete
    var limit = 0;
    var refs = [];
    while (limit < 500 && this.cursor < this.log.time) {
      limit++;
      if (this.match_obj(this.cursor, 'FRAME')) {
        refs.push(this.cursor);
        this.forward();
        return refs;
      } else {
        refs.push(this.cursor);
        this.forward();
      }
    }
    console.log('forward_frame. end');
    return refs;
  },

  backward: function() {
    var c = this.cursor;
    if (c > 0) {
      this.undo_op(c-1, this.lookr(c-1));
      this.cursor--;
    } else {
      console.log('backward. start');
    }
  },
  backward_frame: function() {
    // TODO delete
    var limit = 0;
    var refs = [];
    while (limit < 500 && this.cursor > 0) {
      limit++;
      if (this.match_obj(this.cursor-1, 'FRAME')) {
        refs.push(this.cursor-1);
        this.backward();
        return refs;
      } else {
        refs.push(this.cursor);
        this.backward();
      }
    }
    console.log('backward_frame. end');
    return refs;
  },

  make_dependent: function(time) {
    var dep = new context(this.globals, this);
    this.dependent = dep;
    dep.replay();
    dep.rewind(time);
    dep.forward_frame();
  },

  replay: function() {
    while (this.cursor < this.log.time) {
      this.forward();
    }
  },
  rewind: function(time) {
    if (time === undefined) {
      time = 0;
    }
    while (this.cursor > time) {
      this.backward();
    }
  },

  // Log: 1 member
  add: function(obj) {
    var cause = this.current_cause
    var ref = this.log.add({
      cause: this.log.copy_cause(cause),
      val: obj});
    this.current_cause.count++;
    return ref;
  },

  mk_cursor: function(time) {
    return this.cursor_log.add(time);
  },
  print_from: function(cursor) {
    this.log.print_from(this.cursor_log.look(cursor));
    this.cursor_log.set(cursor, this.log.time);
  },

  lookd: function(ref) {
    return this.data[ref];
  },
  lookv: function(ref) {
    return this.data[ref].head;
  },
  lookr: function(ref) {
    return this.log.look(ref);
  },
  l: function(name) {
    return this.root.l(name);
  },
  r: function(name) {
    return this.root.r(name);
  },

  get_ptr_name: function(ref) {
    var w = this;
    var ptr = this.lookr(ref).val;
    while (ptr.type === T.ptr_edit) {
      ptr = w.lookr(ptr.prior).val;
    }
    return ptr.name;
  },
  tlook: function(t0, ref) {
    var w = this;
    var ptr = ref;
    while (ptr > t0) {
      ptr = w.lookr(ptr).val.prior;
    }
    return w.lookd(w.lookr(ptr).val.val);
  },
  pchain: function(ref) {
    var w = this;
    var ptr = w.lookr(ref).val;
    var result = [];
    while (ptr.prior !== undefined) {
      result.push(ptr.val);
      ptr = w.lookr(ptr.prior).val;
    }
    return result;
  },

  // TODO if anything external is ever automatically run by 'add' modifying log
  // after the add is a bad idea
  mkroot: function() {
    var new_root = this.mk('root');
    this.root = new_root;
    this.current_cause = {ref: new_root.ref, count: 1};

    return new_root;

    //// Get raw log entry for potential modification :/
    //var entry = this.log.look(new_root.ref);
    //if (entry.cause.ref === undefined) {
    //  // Do self-justification
    //  entry.cause = {ref: new_root.ref, count: 0};
    //  this.current_cause = {ref: new_root.ref, count: 1};
    //} else {
    //  this.current_cause = {ref: new_root.ref, count: 0};
    //}
  },


  do_newptr: function(ref, entry) {
    var w = this;

    var ptr_obj = {
      pref: ref,
      dref: undefined, // No initial value; set by modptr
      r: function() { 
        if (w.replay_time !== undefined) {
          console.log('replay ref: ', this);
          return w.tlook(w.replay_time, this.pref);
        } else {
          return w.lookd(this.dref);
        }
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

  undo_modptr: function(ref, entry) {
    var ptr_obj = this.ptrs[ref];
    ptr_obj.pref = entry.prior;
    var previous = this.lookr(entry.prior).val;
    if (previous.val) {
      ptr_obj.dref = this.lookd(previous.val).ref;
    } else {
      ptr_obj.dref = undefined;
    }
    return ptr_obj;
  },

  do_modptr: function(ref, entry) {
    var ptr_obj = this.ptrs[entry.prior];
    ptr_obj.pref = ref;
    ptr_obj.dref = entry.val;
    // Update at new pref
    this.ptrs[ref] = ptr_obj;

    // TODO remove hack
    var maybe_fn = this.lookd(entry.val).fn;
    if (maybe_fn) {
      this.lookd(entry.val).fn_name_guess = this.get_ptr_name(ref);
    }
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
    var w = this;
    var data = {
      head: entry.head,
      ref: ref,
      names: {},

      l: function(name) {
        return this.names[name];
      },
      set: function(name, val) {
        return this.l(name).mod(val);
      },
      r: function(name) {
        if (this.names[name]) {
          return this.names[name].r();
        }  else {
          console.log(this.ref+":'" + this.head + "'" + " does not have field " + "'" + name + "'");
          return undefined;
        }
      },
//      newptr: function(name) {
//        return w.newptr(this, name);
//      }
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
      var fn_obj = eval('(' + entry.fn + ')');
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
    var fn_str = jsfn.toString();
    var entry = {
      type: T.fn,
      fn: fn_str
    };
    var ref = this.add(entry);

    return this.do_mkfn(ref, entry);
  },

  do_app: function(ref, entry) {
    var w = this;
    var fn = this.lookd(entry.fn);
    var args = _.map(entry.args, function(ref) {
      return w.lookd(ref);
    });

    var closure = {
      ref: ref,
      fn: fn.fn,
      args: fn.args.concat(args),
    };
    this.data[ref] = closure;

    return closure;
  },
  app: function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var entry = {
      type: T.fn_app,
      fn: fn.ref,
      args: _.pluck(args, 'ref'),
    };
    var app_ref = this.add(entry);

    return this.do_app(app_ref, entry);
  },
  call: function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var entry = {
      type: T.fn_call,
      fn: fn.ref,
      args: _.pluck(args, 'ref'),
    };
    // Log the call
    var call_ref = this.add(entry);
    //var fn_obj = this.lookd(fn_ref);
    var temp_cause = this.current_cause;
    this.current_cause = {ref: call_ref, count: 0};

    // Execute the call
    var result = fn.fn.apply(null, fn.args.concat(args));

    this.current_cause = temp_cause;
    return result;
  },

  undo_extern: function(entry) {
    return this.dom_extern.undo_effect(entry.ref);
  },
  do_extern: function(entry) {
    return this.dom_extern.do_effect(entry.ref);
  },
  extern: function(entry) {
    var ref = this.add({
      type: T.extern,
      ref: entry.ref,
    });

    return entry.node;
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
      case T.fn_app:
        w.do_app(ind, entry);
        break;
      case T.extern:
        w.do_extern(entry);
        break;
      default:
        break;
    }
    w.log.heap[ind] = pair;
    if (ind + 1 > w.log.time) {
      w.log.count = ind + 1;
    }
  },
  undo_op: function(ind, pair) {
    var entry = pair.val;
    switch (entry.type) {
      case T.ptr_edit:
        this.undo_modptr(ind, entry);
        break;
      case T.extern:
        this.undo_extern(entry);
        break;
    }
  },

  // Return descendents of this entry
  get_effects: function(ref) {
    var w = this;
    var desc = [ref];
    for (var i = ref+1; i < w.log.time; i++) {
      var entry = w.log.look(i);
      if (_.contains(desc, entry.cause.ref )) {
        desc.push(i);
      }
    }

    return desc;
  },
  get_causes: function(ref) {
    var w = this;
    var causes = [ref];
    while (ref !== 0) {
      var ref = w.log.look(ref).cause.ref;
      causes.push(ref);
    }
    return causes;
  },

  rollback: function(t0) {
    var w = this;
    var now = w.log.time;

    var liveset = [];
    for (var i = now - 1; i > t0; i--) {
      var entry = w.log.heap[i];
      switch (entry.val.type) {
        case T.ptr_root:
          break;
        case T.ptr_edit:
          break;
        case T.data:
          break;
        case T.fn:
          break;
        default:
          break;

      }
    }
  },
  // Replays call at t0, creates refinement log
  refine: function(t0) {
    var w = this;
    var call = w.lookr(t0).val;
    if (call.type !== T.fn_call) {
      console.log('error, must replay function call');
      return;
    }

    var fn = w.lookd(call.fn);
    var args = _.map(call.args, function(arg) {return w.lookd(arg)});

    w.replay_time = t0;
    w.call.apply(w, [fn].concat(args));
    w.replay_time = undefined;

  },
}

var match = function(data, cases) {
  return _.find(cases, function(body, head) {
    if (data.head === head) {
      return true;
    }
  });
}

module.exports = {
  log: log,
  context: context,
}

