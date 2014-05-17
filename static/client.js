var w;
var session;
var current_time = 0;
console.log('CLIENT');

print_update = function() {
  w.log.print_from(current_time);
  current_time = w.log.count;
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

addHandler = function(ev, fn) {
  window
    .addEventListener(ev, fn)
    ;
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
    }
    w.call(w.rptr('mouse-init').mod(w.mkfn(ui_init_fn)).r());

    var mk_text_elem = function(base, name, text) {
      var te = newptr(base, name.head).mod(mk('text-elem')).r();
      newptr(te, 'maps').mod(r('nil'));
      newptr(te, 'string').mod(mk(text.head));
      //TODO needed?
      //newptr(te, 'set').mod(mkfn(function(self, msg) {
      //  modptr(self.l('string'), msg.r('string'));
      //}));
    }
    w.rptr('mk-text-elem').mod(w.mkfn(mk_text_elem));

    var mk_log = function(id) {
      var div = document.createElement('div'); 
      div.setAttribute('class', 'log');
      div.setAttribute('id', 'div'+id.head);
      var ul = document.createElement('ul');
      ul.setAttribute('id', 'ul'+id.head);
      div.appendChild(ul);
      document.getElementById('main').appendChild(div);
    }
    w.rptr('mk-log').mod(w.mkfn(mk_log));

    var mk_log_elem = function(index_obj, log_pane) {
      var index = index_obj.head;
      var entry = lookr(index);
      var str = log.pp_entry(index);
      var div = document.getElementById('div'+log_pane.head);
      var ul  = document.getElementById('ul'+log_pane.head);

      var entry = document.createElement('li');
      entry.appendChild(document.createTextNode(str));
      ul.appendChild(entry);
      div.scrollByLines(22);

    }
    w.rptr('mk-log-elem').mod(w.mkfn(mk_log_elem));

    var log1 = w.mk(0);
    w.call(w.r('mk-log'), log1);
    for (var i = 0; i < 22; i++) {
      w.call(w.r('mk-log-elem'), w.mk(i), log1);
    }
    var log2 = w.mk(1);
    w.call(w.r('mk-log'), log2);
    for (var i = 23; i < 44; i++) {
      w.call(w.r('mk-log-elem'), w.mk(i), log2);
    }
    //w.call(w.r('mk-log-elem'), w.mk(0));

    // Handlers
    addHandler("click", clickHandler);
    addHandler('contextmenu', function(ev) {
      clickHandler(ev);
      ev.preventDefault();
    });


    //print_update();
  }

  mouse_init();
  console.log('input ready');
  w.log.print();
}


start_session();
