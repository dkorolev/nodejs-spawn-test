var step = require('step');
var child_process = require('child_process');
var readline = require('readline');
var restler = require('restler');

var command = 'node child.js';
var cwd = undefined;

function invokeCurl() {
  var self = this;
  var r = restler.get('http://localhost:' + (process.env.port || 3333)).on('complete', function(result) {
    console.log('Result: ' + result);
    self();
  });
};

var impl = {};

step(
  function() {
    var self = this;
    var params = {
      cwd: undefined,
      env: process.env
    };
    console.log('Spawning the child process and waiting for "READY".')
    // Designed for non-node process, so use spawn() and "bash -c".
    impl.child = child_process.spawn('bash', ['-c', command]);

    function onExit() {
      console.log('Explicitly terminating child process on exit.');
      impl.child.kill();
    };
    process.on('exit', function() {
      onExit();
    });
    impl.child.on('close', function(code) {
      onExit = function() {
        console.log('No need to explicitly terminate child process since it has already been terminated.');
      };
      console.log('Child process terminated with exit code: ' + code);
      console.log('Terminating with the same code.');
      process.exit(code);
    });
    readline.createInterface({
      input: impl.child.stdout,
      output: false
    }).on('line', function(line) {
      if (line.trim().toUpperCase() === 'READY') {
        console.log('Received "READY" from the child process.');
        self();
      } else {
        console.log('Received from child: ' + line);
      }
    });
  },
  function() {
    console.log('Should print 1, 2, 3.');
    this();
  },
  invokeCurl,
  invokeCurl,
  invokeCurl,
  function() {
    impl.child.stdin.write('100\n');
    console.log('Should print 101, 102, 103.');
    this();
  },
  invokeCurl,
  invokeCurl,
  invokeCurl,
  function() {
    var self = this;
    console.log('Type "stop" without quotes to stop before the client process terminates.');
    console.log('Alternatively, type "stopchild" without quotes to have the child process terminate, causing this process to stop too.');
    readline.createInterface({
      input: process.stdin,
      output: false
    }).on('line', function(line) {
      if (line.trim().toUpperCase() === 'STOP') {
        console.log('Received "STOP" from stdin.');
        self();
      } else {
        console.log('Sent to child.');
        impl.child.stdin.write(line + '\n');
      }
    });
  },
  function() {
    console.log('Done.');
    process.exit(0);
  });
