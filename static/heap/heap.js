Ptr = {
  root: 'root',
  edit: 'edit',
};

Cause = {
  root: 'root',
};

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
  this.log = new Env();
  this.current_cause = Cause.root

  this.runtime = {
    _ref: Ptr.root,
    _value: undefined,
    _members: [],
  };
}
// API:
// call(fn, arg) : ptr, ptr
// newptr(baseptr, name) : ptr, str
// modp(ptr, val) : ptr, ptr
// copy(ptr) : ptr
// reset(ref) : ref

World.prototype = {

  add: function(obj) {
    this.log.add(this.current_cause, obj);
  },

  // All arguments are runtime objects
  call: function(fn, arg) {
    
  },

  newptr: function(base, name) {
    var lptr = this.add({
      type: Ptr.root,
      base: base._ref,
      name: name
    });

    var rptr = {
      _ref: lptr,
      _value: undefined
    };

    base._members.push(name);
    base[name] = rptr;

    return rptr;
  },

  newrootptr: function(name) {
    return this.newptr(this.runtime, name);
  },

  modptr: function(ptr, val) {
    var mod = {
      type: Ptr.edit,
      prior: ptr._ref,
      val: val._ref
    };

    ptr._ref = this.add(mod);
    ptr._val = val._val;
  },

  // Resets run using log, ref as a timepoint
  reset: function(ref) {
    var testbar = "(function() { return foo.val; })"
    var testbaz = "(function() { return bar() + 1; })"
    with(this.runtime) {
      this.runtime['bar'] = eval(testbar);
      this.runtime['baz'] = eval(testbaz);
    }
    console.log('bar: ', this.runtime.bar());
    console.log('baz: ', this.runtime.baz());
  },

  copy: function(ptr) {
  },
}

// Bootstrapping //
nil_def = function() {
  var nil = newrootptr('nil');
  var val = add({ head: 'nil' });
  modptr(nil, { 
cons_def = function() {
  var cons = newrootptr('cons');
  newptr(cons, 'head');
  newptr(cons, 'tail');
};
//               //

e = new Env();
e.add(Cause.root, 22);
e.add(Cause.root, 24);


w = new World();

x = w.newrootptr("x");

_.each(w.log.heap, function(o, i) { console.log(i, o); });
