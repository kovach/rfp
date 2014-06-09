var _          = require('underscore');
var dom_extern = require ('../dom-util.js');


var global = 22;

//// TODO delete
//var line_key = function(self, msg) {
//  switch(msg.r('key')) {
//    case 'a':
//      break;
//    case 'e':
//      break;
//    case 'p':
//      break;
//    case 'n':
//      break;
//  }
//}

// Appends key-handling box to main
var mk_key_box = function(keyHandler, cl) {
  var elem = call(r('mk_elem'), mk('main'),
      mk('key-box'), mk('div'), cl);
  call(r('add_key'), elem, keyHandler);

  call(elem.r('node')).focus();

  return elem;
}

var toggle_mode = function(self) {
  if (self.r('mode').head === 'on') {
    self.set('mode', mk('off'));
  } else {
    self.set('mode', mk('on'));
  }
  //console.log(self.r('mode'));
}
var mouse_handler_init = function() {
  var obj = mk('mouse_handlers');
  rptr('char_mouse_handler').mod(obj);

  newptr(obj, 'left').mod(mkfn(function(self) {
  }));
  newptr(obj, 'right').mod(mkfn(function(self) {
    global_mk_stepper(self.ref);
  }));


}
var stepper_handler= function(self, key) {
  switch (key.head) {
    case 'j':
      dependent.forward();
      break;
    case 'k':
      dependent.backward();
      break;
    case 'J':
      dependent.forward_frame();
      break;
    case 'K':
      dependent.backward_frame();
      break;
  }
}
var line_edit_handler = function(self, key) {
  //console.log('key press! ', key);
  switch (key.head) {
    case 'CTRL':
      call(r('toggle_mode'), self);
      break;
    case 'ESC':
      global_mk_stepper(0);
      break;
//    case 'j':
//      dependent.forward();
//      break;
    default:
      if (self.r('mode').head === 'on') {
        switch (key.head) {
          default:
            break;
        }
        self.set('mode', mk('off'));
      } else {
        call(r('mk_text'), self, key, r('char_mouse_handler'));
      }
      break;
  }
}
var mk_line = function() {
  var box = call(r('mk_key_box'), r('line_edit_handler'), mk('p-text'));
  newptr(box, 'mode').mod(mk('off'));
  mk('reset');
  return box;
}
var mk_stepper = function() {
  var box = call(r('mk_key_box'), r('stepper_handler'), mk('stepper'));
  return box;
}

var copy_log = function(context) {
}

module.exports = {
  init: ['mouse_handler_init'],
  exports: {
    mouse_handler_init: mouse_handler_init,
    line_edit_handler: line_edit_handler,
    stepper_handler: stepper_handler,

    mk_key_box: mk_key_box,
    toggle_mode: toggle_mode,

    mk_line: mk_line,
    mk_stepper: mk_stepper,
  },
}
