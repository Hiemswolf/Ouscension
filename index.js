var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var players = new Array();
var lastUpdate = new Date().getTime();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  socket.on('createChar', function(usr) {
    if(usr !== null || undefined) {
      itemCounter++;
      socket.number = itemCounter;
      io.emit('loadNewChar', usr, socket.number);
    }
  });

  socket.on('disconnect', function() {
      io.emit('deleteChar', socket.number);
  });

  socket.on('dead', function(killer) {
      io.emit('kill', killer);
      io.emit('deleteChar', socket.number);
  });

  socket.on('receivePlayer', function(x,y,value,name,dir) {
    io.emit('showPlayer', x, y, value, name, dir);
  });

  socket.on('newBullet', function(x,y,dir,owner,life) {
    itemCounter++;
    io.emit('loadNewBullet',x,y,dir,itemCounter,owner,life);
  });
});


function Update() {
  if(lastUpdate + 40 <= new Date().getTime()) {
    io.emit('getPlayer');
    io.emit('loop');
    if(Math.floor(Math.random() * 120) === 1) {
      var x = Math.floor(Math.random() * 1255);
      var y = Math.floor(Math.random() * 615);

      itemCounter++;
      io.emit('newCrate', itemCounter, x, y);
    }

    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
