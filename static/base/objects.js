var each_fn = function(list, fn) {
  if (list.head === 'cons') {
    call(fn, list.r('head'));
  } else if (list.head === 'nil') {
    return undefined // TODO ??
  } else {
    console.log('EACH. Input not a list.');
  } 
}

var send_msg = function(msg, self) {
  var h = self.r(msg.head);
  if (h) {
    call(h, self, msg);
  }
  call(r('each'), self.r('maps'), app(r('send'), msg));
}
var add_map = function(map, self) {
  self.l('maps').mod(mktup('cons', {head: map, tail: self.r('maps')}));
}

var init_obj = function(self) {
  newptr(self, 'maps').mod(r('nil'));
  return self;
}

module.exports = {
  exports: {
    send_msg: send_msg,
    add_map: add_map,
    init_obj: init_obj,

    each_fn: each_fn,
  },
}
