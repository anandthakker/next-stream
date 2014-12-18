
var Readable = require('readable-stream'),
    inherits = require('inherits');

module.exports = Next;
inherits(Next, Readable);

function Next(streams, opts) {
  if(!(this instanceof Next)) return new Next(streams, opts);
  Readable.call(this);
  
  opts = opts || {};
  this._open = (typeof opts.open === 'undefined') ? true : opts.open;
  
  this._reading = {
    current: null,
    next: [].concat(streams)
  }
  this._shift();
}

Next.prototype.push = function(stream) {
  this._reading.next.push(stream);
  if(!this._reading.current)
    this._shift();
}

Next.prototype.close = function() {
  if(this._reading.current) {
    this._open = false;
  }
  else {
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
  var current = this._reading.current;
  var count = 0;
  
  if(current) {
    var data;
    while((data = current.read()) !== null) {
      this._push(data);
      count++;
    }
    if(count === 0) current.once('readable', this._read.bind(this, n));
  }
  
}

Next.prototype._shift = function() {
  if(!(this._reading.current = this._reading.next.shift())) {
    if(!this._open) this._push(null);
    return;
  }
  this._read();
  this._reading.current.once('end', this._shift.bind(this));
}
