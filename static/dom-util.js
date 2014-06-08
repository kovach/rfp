addHandler = function(ev, fn) {
  return window.addEventListener(ev, fn);
}
addH = function(obj, ev, fn) {
  return obj.addEventListener(ev, fn);
}
addMouse = function(obj, fn) {
  addH(obj, 'click', fn);
  addH(obj, 'contextmenu',  function(ev) {
    fn(ev);
    ev.preventDefault();
  });
}


createElement = function(type, cl, id) {
  var entry = document.createElement(type);
  entry.setAttribute('class', cl);
  entry.setAttribute('id', id);
  return entry;
}
createDiv = function(parent, id) {
  return parent.appendChild(createElement('div', 'div-class', id));
}
createText = function(object, text) {
  return object.appendChild(document.createTextNode(text));
}
getElement = function(id) {
  return document.getElementById(id);
}
