
var Readable = require('readable-stream'),
    inherits = require('inherits');
    
var debug = require('debug')('next-stream');

module.exports = Next;
inherits(Next, Readable);

function Next(streams, opts) {
  if(!(this instanceof Next)) return new Next(streams, opts);
  Readable.call(this);
  
  opts = opts || {};
  this._open = (typeof opts.open === 'undefined') ? true : opts.open;
  
  this._current = null;
  this._next = [].concat(streams);

  // propagate errors in all streams.
  var self = this;
  this._onInnerError = function(e) { self.emit('error', e); }
  this._next.forEach(this._propagateErrors.bind(this));

  this._shift();
}

Next.prototype.push = function(stream) {
  debug('PUSH')
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
      debug('_read', data.toString());
      count++;
    }
    if(count === 0) current.once('readable', this._read.bind(this, n));
  }
  else if(current && current.length > 0) {
    debug('_read non-stream', current)
    var data;
    while(data = current.shift()) {
      this._push(data);
    }
  }
  else if(current && current.length === 0) {
    debug('_read non-stream end');
    this._shift();
  }
}

Next.prototype._shift = function() {
  var self = this;
  debug('SHIFT', this._next.length);
  if(!(this._current = this._next.shift())) {
    debug('_next empty, ending stream.')
    if(!this._open) this._push(null);
    return;
  }
  
  // apply the thunk
  if(typeof this._current === 'function') {
    this._current = this._current();
    this._propagateErrors(this._current);
  }
  
  if(isReadableStream(this._current)) {
    debug('(stream)');
    this._current.once('end', function() { debug('end stream'); self._shift(); });
    this._read();
  }
  else {
    debug('(non-stream)');
    
    var nonStreams = [this._current];
    while(this._next[0] && !isReadableStream(this._next[0]))
      nonStreams.push(this._next.shift());
    this._current = nonStreams;
    this._read();
  }
}

Next.prototype._propagateErrors = function(stream) {
  if(!isReadableStream(stream)) return;

  var self = this;
  stream.on('error', this._onInnerError);
  stream.once('end', function() { stream.removeListener('error', self._onInnerError) });
}


// duck!
function isReadableStream(s) {
  return s && (typeof s.once === 'function')
  && (typeof s.on === 'function')
  && (typeof s.removeListener === 'function')
  && (typeof s.read === 'function');
}
