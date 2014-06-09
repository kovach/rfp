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
  var char_obj = mk('mouse_handlers');
  rptr('char_mouse_handler').mod(char_obj);

  newptr(char_obj, 'left').mod(mkfn(function(self) {
  }));
  newptr(char_obj, 'right').mod(mkfn(function(self) {
    global_mk_stepper(self.ref);
  }));

  var step_obj = mk('mouse_handlers');
  rptr('stepper_mouse_handler').mod(step_obj);
  newptr(step_obj, 'left').mod(mkfn(function(self) {
    console.log('you clicked: ', self.r('ref'));
    //global_set_viewer(self.ref);
  }));
  newptr(step_obj, 'right').mod(mkfn(function(self) {
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
      var refs = dependent.forward_frame();
      var node = call(self.r('node'));
      while(node.firstChild) {
        extern(dom_extern.removeElement(node.firstChild));
      }
      _.each(refs, function(ref) {
        call(r('log_entry'), self, mk(ref));
      });
      break;
    case 'K':
      var refs = dependent.backward_frame();
      refs.reverse();
      console.log(refs);
      var node = call(self.r('node'));
      while(node.firstChild) {
        extern(dom_extern.removeElement(node.firstChild));
      }
      _.each(refs, function(ref) {
        call(r('log_entry'), self, mk(ref));
      });
    case 'ESC':
      //global_mk_viewer();
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
      //global_mk_stepper(0);
      break;
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
  mk('BARRIER');
  return box;
}
var mk_stepper = function() {
  var box = call(r('mk_key_box'), r('stepper_handler'), mk('stepper'));
  return box;
}

var log_entry = function(self, ind) {
  var ref = ind.head;
  var entry = lookr(ref).val;

  // Printing utilities
  // TODO move to ../heap?
  var raw = function(str) {
    return {val: str};
  }
  var space = raw(' ');
  var pp_type = function(type) {
    switch (type) {
      case T.ptr_edit:
        return [raw('mod'), space];
      case T.ptr_root:
        return [raw('new'), space];
      case T.fn_call:
        return [raw('call'), space];
      case T.data:
        return [raw('data'), raw("'")];
      default:
        return [raw('type'), space];
    }
  }

  call(r('mk_text'), self, ind);
  call(r('mk_text'), self, mk(' '));
 //call(r('mk_text'), self, mk(pp(entry.type)));
 //call(r('mk_text'), self, mk(' '));

  var pp_entry = function(ref) {
    var entry = lookr(ref).val;
    var result = pp_type(entry.type);
    switch (entry.type) {
      case T.data:
        result = result.concat([{ref: ref, val: entry.head}, raw("'")]);
        //call(r('mk_text'), self, mk(entry.head));
        break;
      case T.fn:
      case T.fn_app:
        var mname = lookd(ref).fn_name_guess;
        if (mname) {
          result = result.concat([{ref: ref, val: "'" + mname + "'"}]);
        }
        break;
      case T.ptr_root:
        result = result.concat([{ref: ref, val: "'"+entry.name+"'"},
            raw(" in ")]).concat(pp_entry(entry.base));
        break;
      case T.ptr_edit:
        console.log('EDIT ', entry);
        var name = get_ptr_name(ref);
        var val = entry.val;
        result = result.concat([{ref: ref, val: name}, {val: ' -> '}]).
          concat(pp_entry(val)); //, {ref: val, val: val+''}]);
        break;
      case T.fn_call:
        var mname = lookd(entry.fn).fn_name_guess;
        if (mname) {
          result = result.concat([{ref: entry.fn, val: "'" + mname + "'"},
              space]);
        }
        _.each(entry.args, function(ref) {
          var next = pp_entry(ref);
          if (next) {
            result = result.concat(next);
          }
        });
        break;
    }
    return result.concat([space]);
  }
  var str = pp_entry(ref);

  pp_obj = function(obj) {
    if (obj.val) {
      var elem = call(r('mk_text'), self,
          mk(obj.val), r('stepper_mouse_handler'));

      if (obj.ref) {
        newptr(elem, 'ref').mod(mk(obj.ref));
      }
    }
  }

  _.each(str, function(obj) {
    pp_obj(obj);
  });

  call(r('mk_text'), self, mk('\n'));
}
var log_frame = function(self, ind) {
  var ref = ind.head;
  while (!match_obj(ref, 'FRAME')) {
    call(r('log_entry'), self, mk(ref));
    ref++;
  }
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
    log_entry: log_entry,
    log_frame: log_frame,
  },
}
