var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var lastUpdate = new Date().getTime();

var bullets = [];
var portals = [];
var floors = [];
var dungeons = 0;

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
  
  socket.on('dungeonComplete', function(dungeon) {
    io.emit('playerDungeonComplete', dungeon);
    for(i = 0; i < portals.length; i++) {
      if(portals[i].world === dungeon || portals[i].teleport === dungeon) {
        io.emit('delete', portals[i].element);
        portals.splice(i, 1);
        i--;
      }
    }
    for(i = 0; i < floors.length; i++) {
      if(floors[i].world === dungeon) {
        io.emit('delete', floors[i].element);
        floors.splice(i, 1);
        i--;
      }
    }
    
    dungeons--;
    if(dungeons < 1) {
      createDungeon('choose', 5);
    }
  });
  
  socket.on('disconnect', function() {
    io.emit('delete', socket.number);
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

function createPortal(world, teleport, x , y) {
  itemCounter++;
  var portal = createSprite('portal' + itemCounter, x, y, 40, 40);
  portal.world = world;
  portal.teleport = teleport;
  
  portals[portals.length] = portal;
}

createFloor('Hub', -250, -250);

function createFloor(world, x, y) {
  itemCounter++;
  var floor = createSprite('floor' + itemCounter, x, y, 500, 500);
  floor.world = world;
  
  floors[floors.length] = floor;
}

function createEnemy(world, x , y) {
  itemCounter++;
  var enemy = createSprite('enemy' + itemCounter, x, y, 30, 30);
  enemy.world = world;
  
  enemies[enemies.length] = enemy;
}

createDungeon('choose', 5);

function createDungeon(name, length) {
  if(name === 'choose') {
    var names = ['Alpha', 'Beta', 'Delta', 'Zeta', 'Yotta'];
    name = names[Math.floor(Math.random() * 5)];
  }
  
  createPortal('Hub', name, (Math.floor(Math.random() * 5) - 1) * 60, -100);
  
  createFloor(name, -250, -250);
  var floorX = 0;
  var floorY = 0;
  
  for(i = 0; i < length; i++) {
    var change = Math.floor(Math.random() * 4);
    if(change === 0) {floorX++}
    if(change === 1) {floorX--}
    if(change === 2) {floorY++}
    if(change === 3) {floorY--}
    createFloor(name, floorX * 500 - 250, floorY * 500 - 250);
    
    if(Math.floor(Math.random() * 2) === 0) {
      createEnemy(name, floorX * 500 - 15, floorY * 500 - 15);
    }
  }
  createPortal(name, 'Hub', floorX * 500 - 15, floorY * 500 - 15);
  dungeons++;
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
    
    io.emit('loop', bullets, portals, floors, enemies);
    
    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
