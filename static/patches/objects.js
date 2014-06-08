var line_press = function(self, msg) {
  switch(msg.r('key')) {
    case 'a':
      break;
    case 'e':
      break;
    case 'p':
      break;
    case 'n':
      break;
  }
}

var mk_line = function(parent) {
  var obj = mk('patch-line');

  newptr(obj, 'press').mod(r('line_press'));
}

module.exports = {
  exports: {
    line_press: line_press,
    mk_line: mk_line,
  },
}
