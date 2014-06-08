// TODO handle posts without requiring express library
var http = require("http");
//var connect = require("connect");
var express = require('express');
require('express-namespace');

var _ = require('underscore');
// Load heap code
var app = express();
app.namespace('', function() {
  app
  .use(express.static('static'))
  ;
});
var debug = false;
if (!debug) {
  http.createServer(app).listen(4000); 
} else {
}
