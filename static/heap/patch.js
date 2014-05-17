Patch = function() {
  var p = this;
  this.map = {};

  p.apply = function(ref) {
    var result = p.map[ref];
    if (result !== undefined) {
      return result
    }
    return ref;
  };

  p.rewrite = function(entry) {
    var ap = p.apply;
    var cause = ap(entry.cause);
    var val0 = entry.val;
    var val;

    switch (val0.type) {
      case T.ptr_root:
        val = { type: T.ptr_root,
          base: ap(val0.base),
          name: val0.name };
        break;
      case T.ptr_edit:
        val = { type: T.ptr_edit,
          prior: ap(val0.prior),
          val:   ap(val0.val) };
        break;
      case T.data:
        val = { type: T.data,
          head: val0.head };
        break;
      case T.fn:
        val = { type: T.fn,
          fn: val0.fn };
        break;
      case T.fn_call:
        val = { type: T.fn_call,
          fn: val0.fn,
          args: _.map(val0.args, ap) };
        break;
    }

    return { cause: cause, val: val };
  };

  p.add = function(r1, r2) {
    p.map[r1] = r2;
  };
}

Server = function() {
  var p = this;
  p.sessions = {};
  p.session_count = 0;
  // TEST remove
  var w0 =  new World();
  p.world = new World(w0.root, w0.log);

  init_world(p.world);
  p.world.log.print();

  p.start_session = function() {
    var s = p.session_count;
    p.sessions[s] = new Patch();
    p.session_count++;
    return s;
  };

  p.add = function(session, ref, entry) {
    var entry2 = p.sessions[session].rewrite(entry);
    var ref2 = p.log.add(entry2);
    p.sessions[session].add(ref, ref2);
  };
}

//var p = new PatchWorld();
//var s = p.start_session()
//p.add(s, 1, w.log.heap[1])
//p.add(s, 3, w.log.heap[3])
