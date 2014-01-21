# nodejs-spawn-test

## Motivation

Playing around to figure out the best way to start an external process from node.js and ensure that both parent and child terminate if one of them is.

## Logic

### Child

Started as ```node child.js```.

Pauses for three seconds, then prints ```READY``` to stdout and spawns a web server on port 3333.

Stops the web server and terminates after running the web server for thirty seconds.

Web server returns 1, 2, 3, etc. to GET requests to any endpoint. Each GET request increments the number by one.

Also supports readline interface. Specifically:

* Typing in a number sets it to be the new "current" number.
* Typing in an empty string prints the current number.
* Typing in ```stopchild``` terminates the process.

### Parent

Started as ```node parent.js```.

Spawns the child.

Waits for ```READY``` from the child.

Issues three GET requests, that should print 1, 2, 3.

Sends ```100``` to stdin of the child process to reset its number to 100. Issues three more GET requests, that should print 101, 102, 103.

Terminates itself and the child process when ``stop``` is typed in the console.

Sends console inputs other than ```stop``` to the child process and prints its outputs. Effectively, this results in ```stopchild``` to stop both the child process and the parent process.
