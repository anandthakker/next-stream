next-stream [![Build Status](https://travis-ci.org/anandthakker/next-stream.svg?branch=master)](https://travis-ci.org/anandthakker/next-stream)
===========

Concatenate/attach a series of streams `a,b,c,...` "end-to-end", so that the 
result streams from `a` until it ends, then moves on to `b` till it ends, etc.

Supports:
 - **laziness**: If anything in the series is a function instead of a stream, it will be called
when its 'turn' comes up, and its return value will be used in its place.
 - **non-stream items**: If anything in the series is not a readable stream just push it through as a chunk at the appropriate time.
 - **stream errors**: If any of the given streams in the series emits an error, propagate it.


## Usage

```javascript
var next = require('next-stream');

var stream1 = fs.createReadStream('file1.txt'),
    stream2 = fs.createReadStream('file2.txt'),
    joined = next([stream1, stream2]);

joined.push(fs.createReadStream('file3.txt'));
joined.close(); // tell `joined` to emit `end` when the last stream ends.

joined.pipe(process.stdout);
```

Outputs contents of `file1.txt` followed by contents of `file2.txt` and then
the contents of `file3.txt`.

For convenience, non-stream inputs also work as you'd expect:

```javascript
var next = require('next-stream');

var stream1 = fs.createReadStream('file1.txt'),
stream2 = fs.createReadStream('file2.txt'),
joined = next([stream1, '--------- between ---------', stream2]);

joined.pipe(process.stdout);
```

Outputs contents of `file1.txt`, followed by `'--------- between ---------'`,
followed by contents of `file2.txt`.


## Methods

### var joined = next([stream1, stream2, stream3], opts);

Create a new readable next-stream from the readable streams `stream1`,
`stream2`, `stream3`.

By default, `joined` is in *open-ended* mode, which means it
won't emit `'end'` when the last stream in the list ends. Setting `opts.open`
to `false` causes `joined` to end when the last stream ends.

### joined.push(stream4)

Add `stream4` to the end of the list of streams.

### joined.close()

Close `joined` if it is in open-ended mode.


## Events

### `'next'`

Emitted when we've hit the end event of the current stream.  Event payload
is the next stream, or null if there are none.
