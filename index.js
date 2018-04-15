var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var lastUpdate = new Date().getTime();

var bullets = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  socket.on('createChar', function() {
    itemCounter++;
    socket.number = itemCounter;
    io.emit('loadNewChar', socket.number);
  });
  
  socket.on('createBullet', function(player) {
    itemCounter++;
          
    var bullet = createSprite(itemCounter, player.x + player.w / 2, player.y + player.h / 2, 5, 5);
    bullet.angle = player.angle;    
    bullet.lifeTimer = 40;
    
    bullet.mx = (Math.floor(Math.abs(player.angle) * 1.112) + 100) / 100;
    bullet.my = 1 - bullet.mx;
    
    console.log(bullet.mx);
    console.log(bullet.my);
    
    bullets[bullets.length] = bullet;
  });
            
  socket.on('playerInfo', function(val, x , y, angle) {
    io.emit('showPlayer', val, x, y, angle);
  });
  
  socket.on('disconnect', function() {
    
  });
});

function createSprite(element, x, y, w, h) {
  var result = new Object();
  result.element = element;
  result.x = x;
  result.y = y;
  result.w = w;
  result.h = h;
              
  return result;
}

function Update() {
  if(lastUpdate + 40 <= new Date().getTime()) {
    for(i = 0; i < bullets.length; i++) {
      
      bullets[i].x += bullets[i].mx;
      bullets[i].y += bullets[i].my;
      
      bullets[i].lifeTimer--;
      if(bullets[i].lifeTimer < -5) {
        bullets.splice(i, 1);
        i--;
      }
    }
    
    io.emit('loop', bullets);
    
    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
