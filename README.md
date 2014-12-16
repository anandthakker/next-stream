next-stream
===========

Attach two or more streams `a,b,c,...` "end-to-end", so that the result streams from `a` until
it ends, then moves on to `b` till it ends, etc.


## Usage

```javascript
var next = require('next-stream');

var stream1 = fs.createReadStream('file1.txt'),
    stream2 = fs.createReadStream('file2.txt'),
    joined = next([stream1, stream2]);

joined.pipe(process.stdout);
```

Outputs contents of `file1.txt` followed by contents of `file2.txt`.

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
