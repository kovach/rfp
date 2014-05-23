var load_std_lib = function() {
  var head_eq = function(list, el) {
    if (list.head === 'cons') {
      if (list.r('head').head === el.head) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  rptr('head-eq').mod(mkfn(head_eq));

  var push = function(list, el) {
    return mktup('cons', {head: el, tail: list});
  }
  rptr('push').mod(mkfn(push));

}

var length = function(list) {
  if (list.head === 'cons') {
    return 1 + length(list.r('tail'));
  } else {
    return 0;
  }
}
