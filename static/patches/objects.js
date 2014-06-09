var _          = require('underscore');
var dom_extern = require ('../dom-util.js');

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
var mk_key_box = function(keyHandler) {
  var elem = call(r('mk_elem'), mk('main'),
      mk('key-box'), mk('div'), mk('p-text'));
  call(r('add_key'), elem, keyHandler);

  return elem;
}

var toggle_mode = function(self) {
  if (self.r('mode').head === 'on') {
    self.set('mode', mk('off'));
  } else {
    self.set('mode', mk('on'));
  }
  console.log(self.r('mode'));
}
var line_edit_handler = function(self, key) {
  //console.log('key press! ', key);
  switch (key.head) {
    case 'CTRL':
      call(r('toggle_mode'), self);
      break;
    case 'ESC':
      break;
    default:
      if (self.r('mode').head === 'on') {
        switch (key.head) {
          default:
            break;
        }
        self.set('mode', mk('off'));
      } else {
        call(r('mk_text'), self, key);
      }
      break;
  }
}
var mk_line = function() {
  var box = call(r('mk_key_box'), r('line_edit_handler'));
  newptr(box, 'mode').mod(mk('off'));
}

module.exports = {
  exports: {
    mk_key_box: mk_key_box,
    toggle_mode: toggle_mode,
    line_edit_handler: line_edit_handler,
    mk_line: mk_line,
  },
}
