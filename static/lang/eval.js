/*
flip.flip =

 case state
   off -> state = on
   on  -> state = off

fresh ui
ui.makeElement = ...
ui.makeLog = ...

ui.makeBox =
  b = box
  b.left-click = ...
  b.right-click =
    ui.makeLogEntry b

  return b
*/

object = function(c, ref, head) {
  var obj = this;
  obj.c = c;
  obj.ref = ref;
  obj.head = head;
  obj.names = {};

  obj.set = function(name, val) {
    if (!_.contains(obj.names, name)) {
      var p = obj.c.newptr(obj, name);
    } 
    return obj.c.modptr(obj.names[name], val);
  }
  obj.send = function(msg) {
    var args = Array.prototype.slice.call(arguments, 1);
    return obj.c.send.apply(obj.c, [obj, msg].concat(args));
  }
}

module.exports = {
  object: object,
}

//N = {
//  send: {id: 0, f: ['head', 'msg', 'args']},
//  set: {id: 1, f: ['left', 'right']},
//  fn: {id: 2, f: ['lines']},
//  match: {id: 3, f: ['head', 'branches']},
//  branch: {id: 4, f: ['head', 'body']},
//}
//
//var compile = function(expr, side) {
//  switch (expr.type) {
//    case N.send:
//      if (side === 'left') {
//        return function(c) {
//          c.r(expr.head)
//        }
//      }
//      break;
//    case N.set:
//      break;
//    case N.fn:
//      break;
//    case N.branch:
//      break;
//    case N.match:
//      break;
//  }
//}
