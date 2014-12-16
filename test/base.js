
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
