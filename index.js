
var Duplex = require('readable-stream').Duplex,
    inherits = require('inherits');

module.exports = Next;
inherits(Next, Duplex);

function Next(stream1, stream2) {
  if(!(this instanceof Next)) return new Next(stream1, stream2);
  Duplex.call(this);
  
  this._reading = {
    current: null,
    next: [stream1, stream2]
  }
  this._writing = {
    current: null,
    next: [stream1, stream2]
  }
  this._shift(this._reading, 'end');
  this._shift(this._writing, 'finish');
}

Next.prototype._read = function(n) {
  var data = this._reading.current ? this._reading.current.read(n) : null;
  if(data !== null) this.push(data);
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
