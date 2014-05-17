addHandler = function(ev, fn) {
  return window.addEventListener(ev, fn);
}
addH = function(obj, ev, fn) {
  return obj.addEventListener(ev, fn);
}

createElement = function(type, cl, id) {
  var entry = document.createElement(type);
  entry.setAttribute('class', cl);
  entry.setAttribute('id', id);
  return entry;
}
createText = function(object, text) {
  return object.appendChild(document.createTextNode(text));
}
getElement = function(id) {
  return document.getElementById(id);
}
