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
  if (req.readyState == 4) {
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
  req.open("POST", '/start_session', true);
  req.send();
}

//TODO
send_entry = function() {
  msg = 'send';
  req.open("POST", '/send?data=' +
      undefined +
      '?session=' + session, true);
  req.send();
}


init_ui = function() {
  clickHandler = function(ev) {
    console.log(ev);
    var button;
    switch(ev.button) {
      case 0:
        button = w.r('mouse-left');
        break;
      case 1:
        button = w.r('mouse-middle');
        break;
      case 2:
        button = w.r('mouse-right');
        break;
      default:
        // Sensible?
        button = w.r('mouse-left');
        break;
    }
    w.call(w.r('send'), w.mktup('click', {button: button}), w.r('mouse'));

    // Print change
    print_update();
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
    }
    w.call(w.rptr('ui-init').mod(w.mkfn(ui_init_fn)).r());

    var mk_dom_elem = function() {

    }
    w.rptr('mk-dom-elem').mod(w.mkfn(mk_dom_elem));

    var mk_text_elem = function(type, cl, id, str, ref) {
      var entry = createElement(type.head, cl.head, id.head);
      createText(entry, str.head);

      // Mouse handlers
      addH(entry, 'mouseover', function() {
        console.log('hi ', str.head);
        if (ref) {
          console.log('UPDATING FOCUS');
          w.modptr(w.l('focus'), ref.head);
        } else {
          console.log('no ref');
        }
      });

      return entry;
    }
    w.rptr('mk-text-elem').mod(w.mkfn(mk_text_elem));

    var mk_log = function(id) {
      var div = createElement('div', 'log', 'div'+id.head);
      var ul = createElement('ul', '', 'ul'+id.head);
      div.appendChild(ul);
      getElement('main').appendChild(div);
    }
    w.rptr('mk-log').mod(w.mkfn(mk_log));

    var mk_log_elem = function(index_obj, log_pane) {
      var index = index_obj.head;
      var entry = lookr(index);
      var strings = log.pp_entry(index);
      console.log(JSON.stringify(strings));
      console.log(strings);
      
      var ul  = getElement('ul'+log_pane.head);
      var log_entry = createElement('li', 'log-entry', '');
      ul.appendChild(log_entry);

      _.each(strings, function(thing) {
        if (thing.ref) {
          var ref_obj = mk(thing.ref);
          var li = call(r('mk-text-elem'),
            r('div'), r('log-token'), r('id'),
            ref_obj, mk(ref_obj));
        } else {
          var str = thing;
          var li = call(r('mk-text-elem'),
            r('div'), r('log-token'), r('id'),
            mk(str))
        }
        log_entry.appendChild(li);
      });

      var div = getElement('div'+log_pane.head);
      div.scrollByLines(22);

    }
    w.rptr('mk-log-elem').mod(w.mkfn(mk_log_elem));

    var log1 = w.mk(0);
    w.call(w.r('mk-log'), log1);
    for (var i = 0; i < 11; i++) {
      w.call(w.r('mk-log-elem'), w.mk(i), log1);
    }
    //var log2 = w.mk(1);
    //w.call(w.r('mk-log'), log2);
    //for (var i = 23; i < 44; i++) {
    //  w.call(w.r('mk-log-elem'), w.mk(i), log2);
    //}
    //w.call(w.r('mk-log-elem'), w.mk(0));

    // Handlers
    addHandler("click", clickHandler);
    addHandler('contextmenu', function(ev) {
      clickHandler(ev);
      //ev.preventDefault();
    });


    //print_update();
  }

  mouse_init();
  console.log('input ready');
  print_update();
  //w.log.print();
}


start_session();
