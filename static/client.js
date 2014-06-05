// TODO
// add symbol method
// do causes/effects on log
// state viewer
var app_root = "/d";
var w;
var session;
var current_time = 0;
console.log('CLIENT');

print_update = function() {
  w.log.print_from(current_time);
  current_time = w.log.time;
}

// Begins initialization
req = new XMLHttpRequest();
req.onreadystatechange = function() {
  //TODO check for server error
  if (req.readyState == 4 && req.status == 200) {
    //console.log('data: ', req.responseText);
    var json = JSON.parse(req.responseText);
    switch (msg) {
      case 'start':
        session = json.session;
        var data = json.data;
        //console.log('req. data: ', data);
        w = new World();
        _.each(data,
            function(entry, ind) {
              w.log.add(entry);
              w.do_op(ind, entry);
            });
        w.root = w.data[0];

        //TODO fix this
        //var w0 = new World();
        //w0.do_op(0, data[0]);
        //var root = w0.data[0];
        //console.log('root? ', root);
        //w = new World(root, data);

        //print_update();

        init_ui();

        break;
      case 'send':
        break;
    }
  }
};

start_session = function() {
  msg = 'start';
  req.open("POST", app_root + '/start_session', true);
  req.send();
}

//TODO
send_entry = function() {
  msg = 'send';
  req.open("POST", app_root + '/send?data=' +
      undefined +
      '?session=' + session, true);
  req.send();
}


to_button = function(ev) {
  switch(ev.button) {
    case 0:
      return w.r('mouse-left');
    case 1:
      return w.r('mouse-middle');
    case 2:
      return w.r('mouse-right');
    default:
      // Sensible?
      return w.r('mouse-left');
  }
}

init_ui = function() {
  w.rptr('load-std-lib').mod(w.mkfn(load_std_lib));
  w.call(w.r('load-std-lib'));


  clickHandler = function(ev) {
    var button = to_button(ev);
    //w.call(w.r('send'), w.mktup('click', {button: button}), w.r('mouse'));

    // Print change
  }
  var init_constants = function() {
      rptr('li').mod(mk('li'));
      rptr('div').mod(mk('div'));
      rptr('log-entry').mod(mk('log-entry'));
      rptr('log-token').mod(mk('log-token'));
      rptr('id').mod(mk('id'));
  }
  w.call(w.rptr('constants-init').mod(w.mkfn(init_constants)).r());

  var mouse_init = function() {
    // World setup
    var ui_init_fn = function() {
      rptr('mouse-left').mod(mk('mouse-left'));
      rptr('mouse-middle').mod(mk('mouse-middle'));
      rptr('mouse-right').mod(mk('mouse-right'));
      rptr('mouse').mod(mk('mouse'));
      var m = r('mouse');
      //TODO automate this (make object constructor)
      newptr(m, 'maps').mod(r('nil'));
      newptr(m, 'click').mod(mkfn(function(self, msg) {
        console.log(msg.r('button'));
      }));

      rptr('focus').mod(r('nil'));
    }
    w.call(w.rptr('ui-init').mod(w.mkfn(ui_init_fn)).r());

    var mk_dom_elem = function() {

    }
    w.rptr('mk-dom-elem').mod(w.mkfn(mk_dom_elem));

    var text_elem_click = function(self, msg) {
      console.log('click');
      var ref;
      var to_log;
      switch (msg.r('button').head) {
        case 'mouse-right':
          ref = self.ref;
          to_log = get_causes(ref);
          break;
        case 'mouse-left':
          var ro = self.r('ref');
          if (ro) {
            console.log('ro: ', ro);
            ref = ro.head;
            to_log = [ref];
          }
          break;
      }
      if (to_log) {
        _.each(to_log, function(ref) {
          call(r('mk-log-elem'), mk(ref), r('log-log'));
        });
        print_update();
      }
    }
    w.rptr('text-elem-click').mod(w.mkfn(text_elem_click));

    var mk_text_obj = function(obj) {
      // util function
      var make_log = function(refs, log) {
        _.each(refs, function(ref) {
          call(r('mk-log-elem'), mk(ref), log);
        });
      }
      var dom_obj = call(r('init-obj'), mk('dom'));
      // redirect to either 'mouse-left' or 'mouse-right' handler
      newptr(dom_obj, 'click').mod(mkfn(function(self, msg) {
        call(r('send'), self, msg.r('button'));
      }));
      newptr(dom_obj, 'mouse-right').mod(mkfn(function(self, msg) {
        make_log(get_causes(self.ref), r('log-log'));
      }));

      switch (obj.type) {
        case UI.ref:
          newptr(dom_obj, 'ref').mod(obj.ref);
          newptr(dom_obj, 'mouse-left').mod(mkfn(function(self, msg) {
            make_log([self.r('ref').head], r('log-log'));
          }));
          break;
        case UI.fn:
          newptr(dom_obj, 'mouse-left').mod(mkfn(function(self, msg) {
          }));
          break;
        case UI.data:
          newptr(dom_obj, 'mouse-left').mod(mkfn(function(self, msg) {
          }));
          break;
        case UI.str:
          break;
      }
    }
    w.rptr('mk-text-obj').mod(w.mkfn(mk_text_obj));
    
    var mk_text_elem = function(type, cl, str, ref) {
      var dom_obj = call(r('init-obj'), mk('dom'));

      // click handler
      newptr(dom_obj, 'click').mod(r('text-elem-click'));
      if (ref) {
        newptr(dom_obj, 'ref').mod(ref);
      }

      var entry = createElement(type.head, cl.head, dom_obj.ref);
      createText(entry, str.head);

      // mouse handlers
      addMouse(entry, function(ev) {
        var button = to_button(ev);
        call(r('send'),
          mktup('click', {button: button}),
          dom_obj);
      });
      addH(entry, 'mouseenter', function() {
        l('focus').mod(call(r('push'), r('focus'), dom_obj));
        entry.style.border="thin solid red";
        print_update();
      });
      addH(entry, 'mouseleave', function() {
        l('focus').mod(r('focus').r('tail'));
        entry.style.border="thin solid rgba(0,0,0,0)";
        print_update();
      });

      addH(entry, 'mouseover', function() {
        //console.log('hi ', str.head);
        //if (ref) {
        //  console.log('UPDATING FOCUS');
        //  w.modptr(w.l('focus'), ref.head);
        //} else {
        //  console.log('no ref');
        //}
      });

      return entry;
    }
    w.rptr('mk-text-elem').mod(w.mkfn(mk_text_elem));

    var mk_log = function(id) {
      var name = id.head;
      var dom_id = 'ul'+name;
      var div_id = 'div'+name;
      var div = createElement('div', 'log', div_id);
      var ul = createElement('ul', '', dom_id );
      div.appendChild(ul);
      getElement('main').appendChild(div);

      addH(div, 'mouseenter', function() {
      });
      addH(div, 'mouseleave', function() {
      });
    }
    w.rptr('mk-log').mod(w.mkfn(mk_log));

    var mk_log_elem2 = function(index_obj, log_pane) {
      var index = index_obj.head;
      var entry = lookr(index);
      var strings = pp_entry(log, index);
      
      var ul  = getElement('ul'+log_pane.head);
      var log_entry = createElement('li', 'log-entry', '');
      ul.appendChild(log_entry);

      _.each(strings, function(thing) {
        if (thing.ref !== undefined) {
          var ref_obj = mk(thing.ref);
          var li = call(r('mk-text-elem'),
            r('div'), r('log-token'),
            ref_obj, ref_obj);
        } else {
          var str = thing;
          var li = call(r('mk-text-elem'),
            r('div'), r('log-token'),
            mk(str))
        }
        log_entry.appendChild(li);
      });

      var div = getElement('div'+log_pane.head);
      div.scrollByLines(22);

    }
    var mk_log_elem = function(index_obj, log_pane) {
      var index = index_obj.head;
      var entry = lookr(index);
      var objects = pp_objs(log, index);

      _.each(objects, function(obj) {
        //call(r('mk-text-obj'), mktup
      });
    }

    w.rptr('mk-log-elem').mod(w.mkfn(mk_log_elem2));


    //
    // Init actual UI
    //
    w.rptr('log-log').mod(w.mk('log-log'));
    w.call(w.r('mk-log'), w.r('log-log'));
    for(var i = 0; i < 1; i++) {
      w.call(w.r('mk-log-elem'), w.mk(i), w.r('log-log'));
    }

    w.rptr('value-log').mod(w.mk('value-log'));
    //w.call(w.r('mk-log'), w.r('value-log'));

    w.rptr('x').mod(w.mk(22));
    var test_fn = function() {
      console.log('TEST FN ', r('x'));
    }
    w.rptr('test-fn').mod(w.mkfn(test_fn));

    w.call(w.r('test-fn'));
    w.l('x').mod(w.mk(400));
    w.call(w.r('test-fn'));



    //print_update();
  }

  mouse_init();
  console.log('input ready');
  print_update();
}


start_session();
