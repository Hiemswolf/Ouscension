var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var lastUpdate = new Date().getTime();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  socket.on('createChar', function() {
    itemCounter++;
    socket.number = itemCounter;
    io.emit('loadNewChar', socket.number);
  });
  
  socket.on('disconnect', function() {
    
  });
});


function Update() {
  if(lastUpdate + 40 <= new Date().getTime()) {
    
    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
