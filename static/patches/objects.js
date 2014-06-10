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
    var mref = self.r('ref');
    if (mref) {
      console.log('you clicked: ', mref);
      call(r('mk_viewer'), mref);
    }
  }));
  newptr(step_obj, 'right').mod(mkfn(function(self) {
  }));


}
var remove_children = function(self) {
  var node = call(self.r('node'));
  while(node.firstChild) {
    extern(dom_extern.removeElement(node.firstChild));
  }
}
var stepper_handler= function(self, key) {
  switch (key.head) {
    //case 'j':
    //  dependent.forward();
    //  break;
    //case 'k':
    //  dependent.backward();
    //  break;
    case 'j':
      var refs = dependent.forward_frame();
      call(r('remove_children'), self);
      _.each(refs, function(ref) {
        call(r('log_entry'), self, mk(ref));
      });
      break;
    case 'k':
      var refs = dependent.backward_frame();
      refs.reverse();
      call(r('remove_children'), self);
      console.log('self ', self);
      _.each(refs, function(ref) {
        call(r('log_entry'), self, mk(ref));
      });
      break;
    case 'h':
      call(self.r('node')).style.maxWidth = '10px';
      break;
    case 'l':
      call(self.r('node')).style.maxWidth = '';
      break;
    case 'ESC':
      dependent.replay();
      dependent
      dom_extern.removeElement(call(self.r('node')));
      break;
  }
}
var line_edit_handler = function(self, key) {
  update_cursor();
  switch (key.head) {
    case 'CTRL':
      call(r('toggle_mode'), self);
      break;
    case 'ESC':
      // do backspace
      var node = call(self.r('node'));
      extern(dom_extern.removeElement(node.lastChild));
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
var view_handler = function(self, key) {
  switch (key.head) {
    case 'ESC':
      extern(dom_extern.removeElement(call(self.r('node'))));
      break;
  }
}
var null_handler = function(self, key) {
}
var mk_help = function() {
  var box = call(r('mk_key_box'), r('view_handler'), mk('help'));
  var help_string = [
    'type in the next box.',
    '\n',
    'right-click a letter',
    'to time travel.',
    '\n',
    'j/k in the green box',
    'move forward and back.',
    '\n',
    'left-click an element to inspect it.',
    '\n',
    'press ESC to delete a character or a box.',
    '\n',
    'new boxes steal mouse focus.',
    '\n',
    'going too far back in time might break things.',
      ].join('\n');

  call(r('mk_text'), box, mk(help_string));
}
var mk_line = function() {
  var box = call(r('mk_key_box'), r('line_edit_handler'), mk('p-text'));
  newptr(box, 'mode').mod(mk('off'));
  return box;
}
var mk_stepper = function() {
  var box = call(r('mk_key_box'), r('stepper_handler'), mk('stepper'));
  return box;
}
var mk_viewer = function(ref) {
  var box = call(r('mk_key_box'), r('view_handler'), mk('viewer'));
  call(r('update_view'), box, ref);
  //rptr('the_view').mod(box);
}
var update_view = function(box, ptr) {
  var ref = ptr.head;
  //var box = r('the_view');
  if (box) {
    var entry = lookr(ref).val;
    console.log('ENTRY: ', entry);
    call(r('remove_children'), box);
    switch (entry.type) {
      case T.fn:
        var str = entry.fn;
        call(r('mk_text'), box, mk(str));
        break;
      case T.data:
        var refs = get_causes(ref);
        _.each(refs, function(ref) {
          call(r('log_entry'), box, mk(ref));
        });
        break;
    }
  }
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
  var pp_type = function(ref, type) {
    var wref = function(str) {
      return {ref: ref, val: str};
    }
    switch (type) {
      case T.ptr_edit:
        return [wref('mod'), space];
      case T.ptr_root:
        return [wref('new'), space];
      case T.fn_call:
        return [wref('call'), space];
      case T.data:
        return [wref('data'), raw("'")];
      default:
        return [wref(type), space];
    }
  }

  call(r('mk_text'), self, ind);
  call(r('mk_text'), self, mk(' '));
 //call(r('mk_text'), self, mk(pp(entry.type)));
 //call(r('mk_text'), self, mk(' '));

  var pp_entry = function(ref) {
    var entry = lookr(ref).val;
    var result = pp_type(ref, entry.type);
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
//var log_frame = function(self, ind) {
//  var ref = ind.head;
//  while (!match_obj(ref, 'FRAME')) {
//    call(r('log_entry'), self, mk(ref));
//    ref++;
//  }
//}

var copy_log = function(context) {
}

module.exports = {
  init: ['mouse_handler_init'],
  exports: {
    mouse_handler_init: mouse_handler_init,
    line_edit_handler: line_edit_handler,
    stepper_handler: stepper_handler,
    null_handler: null_handler,  
    view_handler: view_handler,

    mk_key_box: mk_key_box,
    toggle_mode: toggle_mode,

    mk_help: mk_help,
    mk_line: mk_line,
    mk_stepper: mk_stepper,
    mk_viewer: mk_viewer,
    update_view: update_view,

    log_entry: log_entry,
    //log_frame: log_frame,

    remove_children: remove_children,
  },
}
