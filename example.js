var fs = require('fs'),
  next = require('./');

var stream1 = fs.createReadStream(__dirname + '/LICENSE'),
stream2 = fs.createReadStream(__dirname + '/README.md'),
joined = next(['\n[BEGIN LICENSE]\n',stream1, '\n[BEGIN README]\n', stream2]);

joined.pipe(process.stdout);
