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
        //_.each(data,
        //    function(entry, ind) {
        //      //console.log(ind, entry);
        //      w.do_op(ind, entry);
        //    });
        //w.root = w.data[0];

        //TODO fix this
        w = new World(data[0], data);

        print_update();

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
    var mouse_init_fn = function() {
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
    w.call(w.rptr('mouse-init').mod(w.mkfn(mouse_init_fn)).r());

    // Handlers
    addHandler("click", clickHandler);
    addHandler('contextmenu', function(ev) {
      clickHandler(ev);
      ev.preventDefault();
    });


    print_update();
  }

  mouse_init();
  console.log('input ready');
}


start_session();
