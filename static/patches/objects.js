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
}
var line_edit_handler = function(self, key) {
  console.log('key press! ', key);
  call(r('mk_text'), self, key);
}
var mk_line = function() {
  var box = call(r('mk_key_box'), r('line_edit_handler'));
}

module.exports = {
  exports: {
    mk_key_box: mk_key_box,
    line_edit_handler: line_edit_handler,
    mk_line: mk_line,
  },
}
