/*

1.
q((s, r), dr) -> s
cost proportional to min( dr*ds, s(r+dr) )

s(r) = denote(log(heap))

2.
content of one message log entry
 1. generic:
   - ref to game id
     - ref to game description
     - ref to game state root
   - move content
   - ref to cause (= move; implement morphisms as special class of games)

 2. heap:
   - move content
     - edit
       - ref to previous value
       - ref to new value content
   - ref to cause (justifying move)

 3. game creation:
   - initiates game state root
   - future log can reference new game id

 */


i = _.uniqueId
none = 'none'
env = { count : 0, heap : [] }
add = function(obj) {
  var id = env.count;
  env.heap[id] = obj;
  env.count += 1;
  return id;
}
look = function(id) { 
  var val = env.heap[id];
  if (_.isNumber(val)) {
    return look(val);
  } else {
    return val;
  }
}


// value
b0 = add(
  { type : 'new'
  , val  : true
  });

// initial state
s0 = add(b0);

// game type
flipper = add(
  { flip :
    function(msg) {
      var b = read('state');
      set('state', !b);
    }
  });

    
g0 = add(
  { state : s0
  , def   : flipper
  });

m0 =
{ move : 'flip'
, game : g0
, cause : none
}
