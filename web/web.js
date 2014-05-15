// TODO handle posts without requiring express library
var http = require("http");
//var connect = require("connect");
var express = require('express');

var fs = require('fs');

var _ = require('underscore');
// Load heap code
eval(fs.readFileSync('static/heap/heap.js')+'');
eval(fs.readFileSync('static/init_world.js')+'');
eval(fs.readFileSync('static/heap/patch.js')+'');


var world = new Server();

var app = express()
  .use(express.static('static'))
  .post('/start_session', function(req, res) {
    console.log('/start_session');
    var s = world.start_session();
    res.send(JSON.stringify({session: s,
      data: world.world.log.heap
    }));
  })
  .post('/send', function(req, res) {
    console.log('/send');
    var data = JSON.parse(req.query.data);
    console.log('data: ', data);
    _.each(data, function(entry, ind) {
      world.add(req.query.session, ind, entry);
    });
    res.send('here is some data...');
  })
  ;

http.createServer(app).listen(3000); 
