var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var itemCounter = 0;
var lastUpdate = new Date().getTime();

var players = [];

var bullets = [];
var portals = [];
var floors = [];
var enemies = [];
var items = [];
var enemyProjectiles = [];
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

  socket.on('createBullet', function(player, bulletType) {
    createBullet(player, bulletType);
  });

  socket.on('playerInfo', function(playerSprite, isMouseDown) {

    var inPlayerArray = false;
    for(i = 0; i < players.length; i++) {
      if(playerSprite.element === players[i].element) {
        inPlayerArray = true;
        players[i] = playerSprite;
      }
    }
    if(inPlayerArray === false) {
      players[players.length] = playerSprite;
    }

    for(i = 0; i < bullets.length; i++) {
      if(bullets[i].type === 'blueMint' && playerSprite.element === bullets[i].owner) {
        if(isMouseDown) {
          var angle = Math.atan2((playerSprite.mouse.y - bullets[i].y), (playerSprite.mouse.x - bullets[i].x)) * (180 / Math.PI);
          bullets[i].rotSpeed = (angle - bullets[i].angle) * 0.05 + bullets[i].rotSpeed * 0.8;
        } else {
          bullets[i].rotSpeed = 0;
        }

        bullets[i].x += 16 * Math.cos(bullets[i].angle * Math.PI / 180);
        bullets[i].y += 16 * Math.sin(bullets[i].angle * Math.PI / 180);
      }
    }

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
    for(i = 0; i < enemies.length; i++) {
      if(enemies[i].world === dungeon) {
        io.emit('delete', enemies[i].element);
        enemies.splice(i, 1);
        i--;
      }
    }
    for(i = 0; i < items.length; i++) {
      if(items[i].world === dungeon) {
        io.emit('delete', items[i].element);
        items.splice(i, 1);
        i--;
      }
    }

    dungeons--;
    if(dungeons < 1) {
      createDungeon('choose', Math.floor(Math.random() * 6) + 5);
    }
  });

  socket.on('hurtEnemy', function(value) {
    for(i = 0; i < enemies.length; i++) {
      if(enemies[i].element === value) {
        enemies[i].hp--;
        if(enemies[i].hp <= 0) {

          if(enemies[i].type === 'skeleton') {
            if(Math.floor(Math.random() * 8) === 0) {
              createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'mint');
            } else {
              if(Math.floor(Math.random() * 8) === 0) {
                createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'lifeSaver');
              } else {
                if(Math.floor(Math.random() * 48) === 0) {
                  createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'limeLifeSaver');
                }
              }
            }
          }

          if(enemies[i].type === 'mage') {
            if(Math.floor(Math.random() * 8) === 0) {
              createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'blueMint');
            } else {
              if(Math.floor(Math.random() * 0) === 0) {
                createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'purpleMint');
              }
            }
          }

          enemies.splice(i, 1);
        }
      }
    }

    io.emit('delete', value);
  });

  socket.on('hurtEnemyProjectile', function(value) {
    for(i = 0; i < enemyProjectiles.length; i++) {
      if(enemyProjectiles[i].element === value) {
        enemyProjectiles[i].hp--;
        if(enemyProjectiles[i].hp <= 0) {

          enemyProjectiles.splice(i, 1);
        }
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteBullet', function(value) {
    for(i = 0; i < bullets.length; i++) {
      if(bullets[i].element === value) {
        bullets.splice(i, 1);
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteItem', function(value) {
    for(i = 0; i < items.length; i++) {
      if(items[i].element === value) {
        items.splice(i, 1);
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteForAll', function(value) {
    io.emit('delete', value);
  });

  socket.on('itemDropped', function(world, x, y, type) {
    createItem(world, x, y, type);
  });

  socket.on('disconnect', function() {
    io.emit('delete', socket.number);
    for(i = 0; i < players.length; i++) {
      if(players[i].element === socket.number) {
        players.splice(i, 1);
        i--;
      }
    }
  });
});


//////////////////////////////////////////////////////////////////////////////


function checkCollision (a,b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function createSprite(element, x, y, w, h) {
  var result = new Object();
  result.element = element;
  result.x = x;
  result.y = y;
  result.w = w;
  result.h = h;

  return result;
}

function blocker(sprite) {
          if(sprite.preX === undefined || sprite.preX === null) {
            sprite.preX = sprite.x;
            sprite.preY = sprite.Y;
          }

          var onFloor = false;

          for(o = 0; o < floors.length; o++) {
            if(sprite.world === floors[o].world) {
              if(checkCollision(sprite, floors[o])) {
                onFloor = true;
              }
            }
          }

          if(!onFloor) {
            sprite.x = sprite.preX;
            sprite.y = sprite.preY;
          }

          sprite.preX = sprite.x;
          sprite.preY = sprite.y;

        }

function createBullet(player, type) {
  itemCounter++;

  var bullet = createSprite(itemCounter, player.x + player.w / 2, player.y + player.h / 2, 5, 5);
  bullet.angle = player.angle;
  bullet.world = player.world;
  if(player.owner != undefined) {
    bullet.owner = player.owner;
  } else {
    bullet.owner = player.element;
  }
  bullet.type = type;

  if(type === 'mint') {
    bullet.mx = 16 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 16 * Math.sin(bullet.angle * Math.PI / 180);
    bullet.rotSpeed = 0;

    bullet.lifeTimer = 60;
  }

  if(type === 'lifeSaver' || type === 'limeLifeSaver') {
    bullet.lifeTimer = 40;

    bullet.mx = 6 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 6 * Math.sin(bullet.angle * Math.PI / 180);
    bullet.rotSpeed = (360 + Math.random() * 60) / bullet.lifeTimer;
  }

  if(type === 'blueMint' || type === 'purpleMint') {
    bullet.lifeTimer = 180;

    bullet.mx = 0;
    bullet.my = 0;
    bullet.rotSpeed = 0;
  }

  bullets[bullets.length] = bullet;
}

function createItem(world, x, y, type) {
  itemCounter++;
  var item = createSprite('item' + itemCounter, x, y, 25, 25);
  item.world = world;
  item.type = type;

  items[items.length] = item;
}

function createPortal(world, teleport, x , y) {
  itemCounter++;
  var portal = createSprite('portal' + itemCounter, x, y, 40, 40);
  portal.world = world;
  portal.teleport = teleport;
  portal.angle = 0;

  portals[portals.length] = portal;
}

createFloor('Hub', -250, -250);

function createFloor(world, x, y) {
  itemCounter++;
  var floor = createSprite('floor' + itemCounter, x, y, 500, 500);
  floor.world = world;

  floors[floors.length] = floor;
}

function createEnemy(world, x , y, type) {
  itemCounter++;
  var size = 30;
  var enemy = createSprite('enemy' + itemCounter, x, y, size, size);
  enemy.world = world;
  enemy.hp = 10;
  enemy.type = type;
  enemy.speed = 10;

  if(type === "mage") {
    enemy.speed = 5;
    enemy.projectileTimer = 24;
  }

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

    for(j = 0; j < Math.floor(Math.random() * 3); j++){
      createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, 'skeleton');
    }
    if(Math.floor(Math.random() * 3) === 0) {
      createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, 'mage');
    }
  }
  createPortal(name, 'Hub', floorX * 500 - 15, floorY * 500 - 15);
  dungeons++;
}


function enemyHandler() {
  for(i = 0; i < enemies.length; i++) {

    var targets = [];

    for(j = 0; j < players.length; j++) {
      if(players[j].world === enemies[i].world) {
        var target = players[j];
        target.distance = Math.hypot(players[j].x - enemies[i].x, players[j].y - enemies[i].y);

        targets[targets.length] = target;
      }
    }

    var closestDistance = 800;
    var closest;
    for(j = 0; j < targets.length; j++) {
      if(targets[j].distance < closestDistance) {
        closest = targets[j];
        closestDistance = targets[j].distance;
      }
    }

    if(closest !== undefined) {
      enemies[i].angle = Math.atan2((closest.y - enemies[i].y), (closest.x - enemies[i].x)) * (180 / Math.PI);

      if(enemies[i].type === "mage") {
        if(closestDistance > 100) {
          enemies[i].x += enemies[i].speed * Math.cos(enemies[i].angle * Math.PI / 180);
          enemies[i].y += enemies[i].speed * Math.sin(enemies[i].angle * Math.PI / 180);
        }

        if(closestDistance < 500 && enemies[i].projectileTimer <= 0) {
          enemies[i].projectileTimer = 24;

          createEnemyProjectile(enemies[i]);
        } else {
          enemies[i].projectileTimer--;
        }
      } else {
        enemies[i].x += enemies[i].speed * Math.cos(enemies[i].angle * Math.PI / 180);
        enemies[i].y += enemies[i].speed * Math.sin(enemies[i].angle * Math.PI / 180);
      }

      for(j = 0; j < enemies.length; j++) {
        if(enemies[i].element != enemies[j].element && enemies[i].world === enemies[j].world) {
          enemies[i].x += 10 / (enemies[i].x - enemies[j].x);
          enemies[i].y += 10 / (enemies[i].y - enemies[j].y);
        }
      }
    }
    blocker(enemies[i]);
  }
}

function createEnemyProjectile(source) {
  itemCounter++;
  var size = 10;
  var enemyProjectile = createSprite('enemy' + itemCounter, source.x, source.y, size, size);
  enemyProjectile.world = source.world;
  enemyProjectile.hp = 1;
  enemyProjectile.angle = source.angle;
  enemyProjectile.lifeTimer = 60;

  enemyProjectile.mx = 14 * Math.cos(enemyProjectile.angle * Math.PI / 180);
  enemyProjectile.my = 14 * Math.sin(enemyProjectile.angle * Math.PI / 180);

  enemyProjectiles[enemyProjectiles.length] = enemyProjectile;
}
function enemyProjectileHandler() {
  for(i = 0; i < enemyProjectiles.length; i++) {

    enemyProjectiles[i].x += enemyProjectiles[i].mx;
    enemyProjectiles[i].y += enemyProjectiles[i].my;

    enemyProjectiles[i].lifeTimer--;
    if(enemyProjectiles[i].lifeTimer < -1) {

      enemyProjectiles.splice(i, 1);
      i--;
    }
  }
}

function bulletHandler() {
  for(i = 0; i < bullets.length; i++) {

    bullets[i].x += bullets[i].mx;
    bullets[i].y += bullets[i].my;
    bullets[i].angle += bullets[i].rotSpeed;

    if(bullets[i].type === 'purpleMint') {
      var closestDistance = 200;
      var closest;

      var targets = [];

      for(j = 0; j < enemies.length; j++) {
        if(enemies[j].world === bullets[i].world) {
          var target = enemies[j];
          target.distance = Math.hypot(enemies[j].x - bullets[i].x, enemies[j].y - bullets[i].y);

          targets[targets.length] = target;
        }
      }

      for(j = 0; j < enemies.length; j++) {
        if(enemies[j].distance < closestDistance) {
          closest = enemies[j];
          closestDistance = enemies[j].distance;
        }
      }

      if(closest !== undefined) {
        var angle = Math.atan2((closest.y - bullets[i].y), (closest.x - bullets[i].x)) * (180 / Math.PI);
        bullets[i].rotSpeed = (angle - bullets[i].angle) * 0.05 + bullets[i].rotSpeed * 0.8;
      }

      bullets[i].x += 16 * Math.cos(bullets[i].angle * Math.PI / 180);
      bullets[i].y += 16 * Math.sin(bullets[i].angle * Math.PI / 180);
    }

    bullets[i].lifeTimer--;
    if(bullets[i].lifeTimer < -1) {
      if(bullets[i].type === 'limeLifeSaver') {
        for(j = 0; j < 6; j++) {
          bullets[i].angle += 60;
          createBullet(bullets[i], 'lifeSaver');
        }
      }
      if(bullets[i].type === 'lifeSaver') {
        for(j = 0; j < 6; j++) {
          bullets[i].angle += 60;
          createBullet(bullets[i], 'mint');
        }
      }

      bullets.splice(i, 1);
      i--;
    }
  }
}

//loop
function Update() {
  if(lastUpdate + 40 <= new Date().getTime()) {

    bulletHandler();
    enemyHandler();
    enemyProjectileHandler();

    for(i = 0; i < portals.length; i++) {
      portals[i].angle += 9;
    }

    io.emit('loop', bullets, portals, floors, enemies, items, enemyProjectiles);

    lastUpdate = new Date().getTime();
  }
  setTimeout(function() {Update();}, 2);
}

Update();

http.listen(port, function(){
  console.log('listening on *:' + port);
});
