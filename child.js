var step = require('step');
var express = require('express');
var readline = require('readline');

var impl = {
  value: 0,
};

step(
  function() {
    readline.createInterface({
      input: process.stdin,
      output: false
    }).on('line', function(line) {
      var command = line.trim().toUpperCase();
      if (command === '') {
        console.log('Value: ' + impl.value);
      } else if (command === 'STOPCHILD') {
        console.log('Stopping child.');
        process.exit(0);
      } else {
        impl.value = Number(command);
        console.log('Value set to: ' + impl.value);
      }
    });
    this();
  },
  function() {
    console.log('Starting in three seconds.');
    setTimeout(this, 3 * 1000);
  },
  function() {
    impl.express = express();
    impl.express.all('*', function(request, response) {
      response.send((++impl.value).toString());
    });
    impl.express.listen(process.env.post || 3333);
    this();
  },
  function() {
    console.log('READY');
    console.log('Tearing down in thirty seconds.');
    setTimeout(this, 30 * 1000);
  },
  function() {
    console.log('DONE');
    process.exit(0);
  });
