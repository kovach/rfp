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

      rptr('focus');
      rptr('log0').mod(mk('log0'));
    }
    w.call(w.rptr('ui-init').mod(w.mkfn(ui_init_fn)).r());

    var mk_dom_elem = function() {

    }
    w.rptr('mk-dom-elem').mod(w.mkfn(mk_dom_elem));

    var text_elem_click = function(self, msg) {
        console.log('click');
        var ref;
        switch (msg.r('button').head) {
          case 'mouse-left':
            ref = self.ref;
            break;
          case 'mouse-right':
            ref = undefined;
            break;
        }
        var causes = w.get_causes(ref);
        _.each(causes, function(ref) {
          w.call(w.r('mk-log-elem'), w.mk(ref), r('log0'));
        });
        print_update();
    }
    w.rptr('text-elem-click').mod(w.mkfn(text_elem_click));
    
    var mk_text_elem = function(type, cl, str, ref) {
      var dom_obj = call(r('init-obj'), mk('dom'));

      // click handler
      newptr(dom_obj, 'click').mod(r('text-elem-click'));

      var entry = createElement(type.head, cl.head, dom_obj.ref);
      createText(entry, str.head);

      // mouse handlers
      addMouse(entry, function(ev) {
        var button = to_button(ev);
        w.call(w.r('send'),
          w.mktup('click', {button: button}),
          dom_obj);
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
    }
    w.rptr('mk-log').mod(w.mkfn(mk_log));

    var mk_log_elem = function(index_obj, log_pane) {
      var index = index_obj.head;
      var entry = lookr(index);
      var strings = log.pp_entry(index);
      
      var ul  = getElement('ul'+log_pane.head);
      var log_entry = createElement('li', 'log-entry', '');
      ul.appendChild(log_entry);

      _.each(strings, function(thing) {
        if (thing.ref !== undefined) {
          var ref_obj = mk(thing.ref);
          var li = call(r('mk-text-elem'),
            r('div'), r('log-token'),
            ref_obj, mk(ref_obj));
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
    w.rptr('mk-log-elem').mod(w.mkfn(mk_log_elem));

    w.rptr('log0').mod(w.mk('log0'));
    w.call(w.r('mk-log'), w.r('log0'));
    for(var i = 0; i < 1; i++) {
      w.call(w.r('mk-log-elem'), w.mk(i), w.r('log0'));
    }
    //var log2 = w.mk(1);
    //w.call(w.r('mk-log'), log2);
    //for (var i = 23; i < 44; i++) {
    //  w.call(w.r('mk-log-elem'), w.mk(i), log2);
    //}
    //w.call(w.r('mk-log-elem'), w.mk(0));

    // Handlers
    //addHandler("click", clickHandler);
    //addHandler('contextmenu', function(ev) {
    //  clickHandler(ev);
    //  //ev.preventDefault();
    //});


    //print_update();
  }

  mouse_init();
  console.log('input ready');
  print_update();
  //w.log.print();
}


start_session();
