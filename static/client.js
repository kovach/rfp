console.log('CLIENT');
var w = new World();
var v = new World();

var pr1 = function() {
  _.each(w.log.heap, function(o, i) {
    console.log(i, o.cause.ref, o.cause.count, o.val); });
};
var pr2 = function() {
  _.each(v.log.heap, function(o, i) {
    console.log(i, o.cause.ref, o.cause.count, o.val); });
};

var init = function() {
  rptr('nil').mod(mk('nil'));

  var zipper_add = function(self, data) {
    var z = self
    z.l('front').mod(mktup('cons', [['head', data], ['tail', z.r('front')]]));
  };

  rptr('zipper-add').mod(mkfn(zipper_add));

  var zipper = function(name_obj) {
    var n = name_obj.head;
    rptr(n).mod(mk('zipper'));
    var z = r(n);
    newptr(z, 'front').mod(r('nil'));
    newptr(z, 'back').mod(r('nil'));
    newptr(z, 'add').mod(r('zipper-add'));
  }
  rptr('zipper').mod(mkfn(zipper));
  rptr('22').mod(mk('22'));

  call(r('zipper'), mk('z1'));

  calls(r('z1').r('add'), [r('z1'), r('22')]);
}

var init= w.rptr('init').mod(w.mkfn(init)).l();
w.calls(init, []);

pr1();

v.load(w);

req = new XMLHttpRequest();
req.onreadystatechange = function() {
  console.log('state: ', req.readyState);
  if (req.readyState == 4) {
    console.log(req.responseText);
  }
};

req.open("POST", '/data?' + 'data=' + w.log.serialize() , true);
req.send();
