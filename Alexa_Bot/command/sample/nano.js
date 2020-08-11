var dbFile = 'abc.txt';
var editorSpawn = require('child_process').spawn("nano", [dbFile], {
  stdio: 'inherit',
  detached: true
});

editorSpawn.on('data', function(data){
  process.stdout.pipe(data);
});