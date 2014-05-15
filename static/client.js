var w = new World();
var session;
console.log('CLIENT');

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
        _.each(data,
            function(entry, ind) {
              //console.log(ind, entry);
              w.do_op(ind, entry);
            });
        //TODO fix this
        w.root = w.data[0];

        w.log.print();

        do_stuff();
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

do_stuff = function() {
}


start_session();
