
var Duplex = require('readable-stream').Duplex,
    inherits = require('inherits');

module.exports = Next;
inherits(Next, Duplex);

function Next(streams) {
  if(!(this instanceof Next)) return new Next(streams);
  Duplex.call(this);
  
  this._reading = {
    current: null,
    next: [].concat(streams)
  }
  this._writing = {
    current: null,
    next: [].concat(streams)
  }
  this._shift(this._reading, 'end');
  this._shift(this._writing, 'finish');
}

Next.prototype.push = function(stream) {
  if(!this._reading.current && this._reading.next.length === 0)
    throw new Error('Next::push after end.');
  if(!this._writing.current && this._writing.next.length === 0)
    throw new Error('Next::push after finish.');
  this._reading.next.push(stream);
  this._writing.next.push(stream);
}

Next.prototype._read = function(n) {
  var data = this._reading.current ? this._reading.current.read(n) : null;
  if(data !== null) Duplex.prototype.push.call(this, data);
  else this._readOnShift = true;
}
Next.prototype._write = function(chunk, enc, next) {
  return this._writing.current.write(chunk, enc, next);
}

Next.prototype._shift = function(side, event) {
  var self = this;

  if(!(side.current = side.next.shift())) {
    this.emit(event);
    return;
  }
  
  if(this._readOnShift) this._read();
  
  var curr = side.current;
  var done = function() {
    curr.removeListener(event, done)
    self._shift(side, event);
  }
  curr.on(event, done);
}
