next-stream
===========

Attach two streams, so that the second one receives data only after the first one finishes and sends data only after the first one ends.


## Usage

### Read stream

```javascript
var next = require('next-stream');

var stream1 = fs.createReadStream('file1.txt'),
    stream2 = fs.createReadStream('file2.txt'),
    joined = next(stream1, stream2);

joined.pipe(process.stdout);
```

Outputs contents of `file1.txt` followed by contents of `file2.txt`.


### Write stream

How should this work?  Should it swallow the first `end` event, using that
to shift to the next stream?
