var init = function() {
  var base_init = function() {
    // 22
    rptr('22').mod(mk('22'));

    // nil
    rptr('nil').mod(mk('nil'));
  }

  var zipper_demo = function() {
    // zipper_add
    var zipper_add = function(self, data) {
      var z = self
        //z.l('front').mod(mktup('cons', [['head', data], ['tail', z.r('front')]]));
        z.l('front').mod(mktup('cons', {head: data, tail: z.r('front')}));
    };
    rptr('zipper-add').mod(mkfn(zipper_add));

    // Zipper
    var zipper = function(name_obj) {
      var n = name_obj.head;
      rptr(n).mod(mk('zipper'));
      var z = r(n);
      newptr(z, 'front').mod(r('nil'));
      newptr(z, 'back').mod(r('nil'));
      newptr(z, 'add').mod(r('zipper-add'));
    }
    rptr('zipper').mod(mkfn(zipper));
  }

  var object_init = function() {
    var each_fn = function(list, fn) {
      if (list.head === 'cons') {
        call(fn, list.r('head'));
      } else if (list.head === 'nil') {
        return undefined // TODO ??
      } else {
        console.log('EACH. Input not a list.');
      } 
    }
    rptr('each').mod(mkfn(each_fn));

    // Core object functions
    var send_msg = function(msg, self) {
      var h = self.r(msg.head);
      if (h) {
        call(h, self, msg);
      }
      call(r('each'), self.r('maps'), app(r('send'), msg));
    }
    rptr('send').mod(mkfn(send_msg));
    var add_map = function(map, self) {
      self.l('maps').mod(mktup('cons', {head: map, tail: self.r('maps')}));
    }
    rptr('add-map').mod(mkfn(add_map));
    // End object functions
  }

  var flip_demo_def = function() {
    // Flip machine (boolean)
    rptr('on').mod(mk('on'));
    rptr('off').mod(mk('off'));
    rptr('msg-flip').mod(mk('flip'));
    var flip_flip = function(self, msg) {
      if (self.r('state').head == 'on') {
        self.l('state').mod(r('off'));
      } else {
        self.l('state').mod(r('on'));
      }
    }
    rptr('flip.flip').mod(mkfn(flip_flip));

    var flip = function(name_obj) {
      var n = name_obj.head;
      rptr(n).mod(mk('flip'));
      var f = r(n);
      newptr(f, 'state').mod(r('on'));
      newptr(f, 'flip').mod(r('flip.flip'));
      newptr(f, 'maps').mod(r('nil'));
    }
    rptr('flip').mod(mkfn(flip));
    // End Flip

    rptr('mouse').mod(mk('mouse'));
  }
  var flip_demo_mk = function() {
    // Make some stuff
    call(r('flip'), mk('f1'));
    call(r('flip'), mk('f2'));
    var send_flip = app(r('send'), r('msg-flip'));
    // Offset f2
    call(send_flip, r('f2'));

    console.log('f1: ', r('f1').r('state'));
    console.log('f2: ', r('f2').r('state'));

    // Adds f2 as a dependent to f1
    call(r('add-map'), r('f2'), r('f1'));
    // Watch propagation
    call(send_flip, r('f1'));
    console.log('f1: ', r('f1').r('state'));
    console.log('f2: ', r('f2').r('state'));
    call(send_flip, r('f1'));
    console.log('f1: ', r('f1').r('state'));
    console.log('f2: ', r('f2').r('state'));
  }

  // Do Init
  base_init();
  object_init();

  //flip_demo_def();
  //flip_demo_mk();
}

init_world = function(w) {
  var init_ptr = w.rptr('init').mod(w.mkfn(init)).r();
  w.call(init_ptr);
};
