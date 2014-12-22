
var Readable = require('readable-stream'),
    inherits = require('inherits');

module.exports = Next;
inherits(Next, Readable);

function Next(streams, opts) {
  if(!(this instanceof Next)) return new Next(streams, opts);
  Readable.call(this);
  
  opts = opts || {};
  this._open = (typeof opts.open === 'undefined') ? true : opts.open;
  
  this._current = null;
  this._next = [].concat(streams);
  this._shift();
}

Next.prototype.push = function(stream) {
  this._next.push(stream);
  if(!this._current)
    this._shift();
}

Next.prototype.close = function() {
  this._open = false;
  if(!this._current) {
    this._push(null);
  }
}

Next.prototype.open = function() {
  // TODO: check if already ended.
  this._open = true;
}

Next.prototype._push = Readable.prototype.push;
Next.prototype._read = function(n) {
  var self = this;
  var current = this._current;
  var count = 0;
  
  if(isReadableStream(current)) {
    var data;
    while((data = current.read()) !== null) {
      this._push(data);
      count++;
    }
    if(count === 0) current.once('readable', this._read.bind(this, n));
  }
  else if(current) {
    var data;
    while(data = current.shift())
      this._push(data);
    this._shift();
  }
  
}

Next.prototype._shift = function() {
  if(!(this._current = this._next.shift())) {
    if(!this._open) this._push(null);
    return;
  }
  if(isReadableStream(this._current)) {
    this._current.once('end', this._shift.bind(this));
    this._read();
  }
  else {
    var nonStreams = [this._current];
    while(this._next[0] && !isReadableStream(this._next[0]))
      nonStreams.push(this._next.shift());
    this._current = nonStreams;
    this._read();
  }
}


function isReadableStream(s) {
  return s && (typeof s.once === 'function') && (typeof s.read === 'function');
}
