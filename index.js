var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var lastUpdate = new Date().getTime();

var bullets = [];
var portals = [];
var floors = [];

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
    bullet.world = player.world;
    
    var speed = 5;
    
    bullet.mx = 5 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 5 * Math.sin(bullet.angle * Math.PI / 180);
    
    bullets[bullets.length] = bullet;
  });
            
  socket.on('playerInfo', function(playerSprite) {
    io.emit('showPlayer', playerSprite);
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

//createPortal('Hub', 'Dungeon1', 0, -100);
//createPortal('Dungeon1', 'Hub', 200, 0);

function createPortal(world, teleport, x , y) {
  itemCounter++;
  var portal = createSprite('portal' + itemCounter, x, y, 30, 30);
  portal.world = world;
  portal.teleport = teleport;
  
  portals[portals.length] = portal;
}

createFloor('Hub', -250, -250);
//createFloor('Dungeon1', -250, -250);

function createFloor(world, x, y) {
  itemCounter++;
  var floor = createSprite('floor' + itemCounter, x, y, 500, 500);
  floor.world = world;
  
  floors[floors.length] = floor;
}

createDungeon('Dungeon1', 5);

function createDungeon(name, length) {
  createPortal('Hub', name, (Math.floor(Math.random() * 5) - 1) * 60, -100);
  
  createFloor(name, -250, -250);
  var floorX = 0;
  var floorY = 0;
  console.log('moew');
  for(i = 0; i < length; i++) {
    var change = Math.floor(Math.random() * 4);
    if(change === 0) {floorX++}
    if(change === 1) {floorX--}
    if(change === 2) {floorY++}
    if(change === 3) {floorY--}
    console.log('mew');
    createFloor(name, floorX * 500 - 250, floorY * 500 - 250);
  }
  console.log('mmmmeow');
  createPortal(name, 'Hub', floorX * 500 - 15, floorY * 500 - 15);
}


//loop
function Update() {
  if(lastUpdate + 40 <= new Date().getTime()) {
    for(i = 0; i < bullets.length; i++) {
      
      bullets[i].x += bullets[i].mx;
      bullets[i].y += bullets[i].my;
      
      bullets[i].lifeTimer--;
      if(bullets[i].lifeTimer < -1) {
        bullets.splice(i, 1);
        i--;
      }
    }
    
    io.emit('loop', bullets, portals, floors);
    
    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
