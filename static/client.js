var world = new World();
var session;
console.log('CLIENT');

req = new XMLHttpRequest();
req.onreadystatechange = function() {
  //TODO check for error
  if (req.readyState == 4) {
    //console.log('data: ', req.responseText);
    var json = JSON.parse(req.responseText);
    switch (msg) {
      case 'start':
        session = json.session;
        var data = json.data;
        _.each(data,
            function(entry, ind) {
              //console.log(ind, entry);
              world.do_op(ind, entry);
            });
        world.log.print();
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


start_session();
