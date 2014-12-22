
var fs = require('fs'),
    test = require('tape'),
    through = require('through2'),
    concat = require('concat-stream'),
    next = require('../');

test('reading', function(t) {
  var s1 = through.obj(),
  s2 = through.obj(),
  joined = next([s1, s2], {open: false});
  
  s1.write('a');
  s2.write('xyz');
  s1.write('bc');
  s1.end();
  s2.end();
  
  
  joined.pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
})

test('open-ended mode', function(t) {
  var s1 = through.obj(),
    s2 = through.obj(),
    joined = next([s1], {open: true});

  s1.end('abc');
    
  joined
  .pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
  
  joined.push(s2);
  s2.end('xyz');
  
  joined.close();
  
})

test('add a stream after creating', function(t) {
  var s1 = through.obj(),
    s2 = through.obj(),
    joined = next([s1], {open: false});
  
  joined.push(s2);
  
  s1.write('a');
  s2.write('xyz');
  s1.write('bc');
  s1.end();
  s2.end();
  
  joined.pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
})

test('add a stream after empty in open-ended mode', function(t) {
  var s1 = through.obj(),
  s2 = through.obj(),
  joined = next([], {open: true});

  joined.push(s1);
  s1.end('abc');
  
  joined
  .pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abc');
    t.end();
  }));
  
  joined.close();
})


test('accept non-stream item after stream item', function(t) {
  var s1 = through.obj(),
  s2 = 'xyz',
  joined = next([s1, s2], {open: false});
  
  s1.write('a');
  s1.write('bc');
  s1.end();
  
  joined.pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
})

test('accept non-stream item before stream item', function(t) {
  var s1 = through.obj(),
  s2 = 'xyz',
  joined = next([s2, s1], {open: false});
  
  s1.write('a');
  s1.write('bc');
  s1.end();
  
  joined.pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'xyzabc');
    t.end();
  }));
})

test('add a non-stream after empty in open-ended mode', function(t) {
  var s1 = through.obj(),
  joined = next([s1], {open: true});
  
  joined
  .pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
  s1.on('end', function() {
    t.notOk(joined._current);
    joined.push('xyz');
    joined.close();
  })
  s1.end('abc');
})


test('add a non-stream in open-ended mode', function(t) {
  var s1 = through.obj(),
  joined = next([s1], {open: true});
  
  joined
  .pipe(concat({encoding: 'string'}, function(data) {
    t.equal(data, 'abcxyz');
    t.end();
  }));
  s1.end('abc');
  
  joined.push('xyz');
  joined.close();
  
})
