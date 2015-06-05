var spawn = require('child_process').spawn;
var fs = require('fs');
var out = fs.openSync('./out.log', 'a');
var err = fs.openSync('./err.log', 'a');

var child = spawn('node', ['pc.js'], {cwd:'/usr/local/data-pump', detached:true, stdio:['ignore', out, err]});
child.unref();
