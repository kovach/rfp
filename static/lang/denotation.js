var _ = require('underscore');
var o = require('./eval.js');

var log = function() {
  this.time = 0;
  this.heap = [];
}

log.prototype = {
  look: function(ref) {
    return this.heap[ref];
  },

  add: function(thing) {
    var ref = this.time;
    var val = thing;
    this.heap[ref] = val;
    this.time++;
    return ref;
  },

  print: function() {
    _.each(this.heap, function(o, i) {
      console.log(i, o);
    });
  },
}

var T = {
  data: 'data',
  fn: 'fn',
  ptr: 'ptr',
  mod: 'mod',
  send: 'send',
  extern: 'extern',
  ref: 'ref',
}
var entry = function(type, val) {
  this.type = type;
  this.val = val;
}

var S = {
  ref: 'ref',
  chain: 'chain',
}

/*
ref = chain [name]
    | ref ref
   */

var context = function() {
  var c = this;
  c.log = new log();
  c.data = {};
  c.ptrs = {};

  c.names = {};
  // TODO delete?
  c.ref = undefined;

  var root = c.mk('context');
  c.stack = [root];
}

context.prototype = {
  add: function(entry) {
    return this.log.add(entry);
  },
  p: function() {
    this.log.print();
  },

  do_entry: function(ref, entry) {
    // TODO
  },
  rewind: function(time) {
    var result = new context();
    _.find(this.log, function(entry, ref) {
      if (ref > time) {
        return true;
      }
      result.do_entry(ref, entry);
    });

    return result;
  },

  cursor: function() {
    return _.last(this.stack);
  },

  lookd: function(ref) {
    return this.data[ref];
  },
  look: function(context, spec) {
    switch (spec.type) {
      case S.ref:
        return this.data[spec.ref];
      case S.chain:
        var name = spec.name;
        var lk = function(obj) {
          if (_.contains(obj.names, name)) {
            return obj.names[name];
          } else if (obj.parent) {
            return lk(obj.parent);
          } else {
            console.log('context.look; ', context.ref,
                ' does not contain ', name);
          }
        }

        return lk(context);
    }
  },

  r: function(spec) {
    return this.look(this.cursor(), spec).r();
  },

  push: function(obj, fn) {
    this.stack.push(obj);
    var result = fn();
    this.stack.pop();
    return result;
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
    w.data[entry.base].names[entry.name] = ptr_obj;
    w.ptrs[ref] = ptr_obj;

    return ptr_obj;
  },
  newptr: function(data, name) {
    var entry = {
      type: T.ptr,
      base: data.ref,
      name: name
    };
    var ref = this.add(entry);

    return this.do_newptr(ref, entry);
  },
  fresh: function(name) {
    return this.newptr(this.cursor(), name);
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
      type: T.mod,
      prior: ptr.pref,
      val: data.ref,
    };
    var ref = this.add(entry)
    return this.do_modptr(ref, entry);
  },

  do_mk: function(ref, entry) {
    var w = this;
    var data = new o.object(w, ref, entry.head);
    //var data = {
    //  head: entry.head,
    //  ref: ref,
    //  names: {},
    //};

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

  mkframe: function(entry) {
    var c = this;
    var bindings = _.map(entry.args, function(arg) {
      return c.look(entry.context, arg);
    });
    var frame = c.mktup('frame', bindings);
    return c.push(frame, c.look(entry.parent, entry.msg));
  },

  do_send: function(ref, entry) {
  },
  send: function(name, msg) {
    var args = Array.prototype.slice.call(arguments, 2);
    var cursor = this.cursor();
    var obj = look(cursor, name);
    var entry = {
      type: T.send,
      context: cursor, // TODO needed?
      parent: obj,
      msg: msg,
      args: _.pluck(args, 'ref'),
    }
    console.log('send: ', entry);
    var ref = this.add(entry);
    return this.mkframe(entry);
  },
}


module.exports = {
  log: log,
  context: context,
}
