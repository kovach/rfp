// TODO handle posts without requiring express library
var http = require("http");
//var connect = require("connect");
var express = require('express');

var fs = require('fs');

var _ = require('underscore');
// Load heap code
eval(fs.readFileSync('static/heap/heap.js')+'');

var app = express()
  .use(express.static('static'))
  .post('/data', function(req, res) {
    //console.log('DATA ', req);
    console.log('data: ', req.query.data);
    res.send('here is some data...');
  });

http.createServer(app).listen(3000); 
