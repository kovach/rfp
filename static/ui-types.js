UI = {}
UI.ref = 'ref';
UI.fn = 'fn';
UI.data = 'data';
UI.str = 'str';

mk_ref = function(ref) {
  return {type : UI.ref, ref: ref };
}
mk_fn = function(ref, fn) {
  return {type : UI.fn, ref: ref, fn: fn };
}
mk_data = function(ref, head) {
  return {type : UI.data, ref: ref, head: head };
}
mk_str = function(str) {
  return {type : UI.str, str: str };
}

// TODO make these internal functions
pp_entry = function(log, ref) {
  var entry = log.look(ref);
  var cause = entry.cause;
  var val = entry.val;
  var r = function(ref) {
    return {ref: ref};
  }
  var wrap = function(str) {
    return "'" + str + "'";
  }

  var result = [r(ref), ':'];
  switch (val.type) {
    case T.ptr_root:
      result = result.concat(['ptr', wrap(val.name), r(val.base)]);
      break;
    case T.ptr_edit:
      result = result.concat(['edit', r(val.prior) , ' -> ' , r(val.val)]);
      break;
    case T.data:
      result = result.concat(['data' , wrap(val.head)]);
      break;
    case T.fn:
      result = result.concat(['fn']);
      break;
    case T.fn_call:
      result = result.concat(['call', r(val.fn)])
        .concat(_.map(val.args, r));
      break;
    case T.fn_app:
      result = result.concat(['app', r(val.fn)])
        .concat(_.map(val.args, r));
      break;
    default:
      break;
  }
  return result;
}

pp_objs = function(log, ref) {
  var entry = log.look(ref);
  var cause = entry.cause;
  var val = entry.val;
  var r = function(ref) {
    return {ref: ref};
  }
  var wrap = function(str) {
    return "'" + str + "'";
  }

  var result = [mk_ref(ref), mk_str(':')];
  switch (val.type) {
    case T.ptr_root:
      result = result.concat([mk_str('ptr'),
          mk_str(val.name), mk_ref(val.base)]);
      break;
    case T.ptr_edit:
      result = result.concat([mk_str('edit'), mk_ref(val.prior),
          mk_str(' -> '), mk_ref(val.val)]);
      break;
    case T.data:
      result = result.concat([mk_str('data') , mk_data(ref, val.head)]);
      break;
    case T.fn:
      result = result.concat([mk_fn(ref, val.fn)]);
      break;
    case T.fn_call:
      result = result.concat([mk_str('call'), mk_ref(val.fn)])
        .concat(_.map(val.args, mk_ref));
      break;
    case T.fn_app:
      result = result.concat([mk_str('app'), mk_ref(val.fn)])
        .concat(_.map(val.args, mk_ref));
      break;
    default:
      break;
  }
  return result;
}
