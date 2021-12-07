
const { createSprite, createDungeon } = require('./mutualFunctions');

function createGreenOrangeMint(bullet) {
  let bulletSpawner = new Object();
  bulletSpawner.element = bullet.owner;
  bulletSpawner.world = bullet.world;
  bulletSpawner.w = 10;
  bulletSpawner.h = 5;

  bullet.x += 45 * Math.cos(bullet.angle * Math.PI / 180);
  bullet.y += 45 * Math.sin(bullet.angle * Math.PI / 180);
  bullet.angle += 90;
  bullet.x += 8 * Math.cos(bullet.angle * Math.PI / 180);
  bullet.y += 8 * Math.sin(bullet.angle * Math.PI / 180);
  bullet.angle -= 45;

  bulletSpawner.x = bullet.x;
  bulletSpawner.y = bullet.y;
  bulletSpawner.angle = bullet.angle;
  createBullet(bulletSpawner, 'greenOrangeMint');

  bullet.angle -= 135;
  bullet.x += 8 * Math.cos(bullet.angle * Math.PI / 180);
  bullet.y += 8 * Math.sin(bullet.angle * Math.PI / 180);
  bullet.angle += 45;

  bulletSpawner.x = bullet.x;
  bulletSpawner.y = bullet.y;
  bulletSpawner.angle = bullet.angle;
  createBullet(bulletSpawner, 'greenOrangeMint');
}

function createBullet(player, type) {
  itemCounter++;

  let bullet = createSprite(itemCounter, player.x + player.w / 2, player.y + player.h / 2, 5, 5);
  bullet.angle = player.angle;
  bullet.world = player.world;
  if (player.owner != undefined) {
    bullet.owner = player.owner;
  } else {
    bullet.owner = player.element;
  }
  bullet.type = type;

  if (type === 'mint') {
    bullet.mx = 16 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 16 * Math.sin(bullet.angle * Math.PI / 180);
    bullet.rotSpeed = 0;

    bullet.lifeTimer = 60;
  }

  if (type === 'greenOrangeMint') {
    bullet.mx = 8 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 8 * Math.sin(bullet.angle * Math.PI / 180);
    bullet.rotSpeed = 0;

    bullet.lifeTimer = 60;
  }

  if (type === 'lifeSaver' || type === 'limeLifeSaver') {
    bullet.lifeTimer = 40;

    bullet.mx = 6 * Math.cos(bullet.angle * Math.PI / 180);
    bullet.my = 6 * Math.sin(bullet.angle * Math.PI / 180);
    bullet.rotSpeed = (360 + Math.random() * 60) / bullet.lifeTimer;
  }

  if (type === 'blueMint') {
    bullet.lifeTimer = 180;

    bullet.mx = 0;
    bullet.my = 0;
    bullet.rotSpeed = 0;
  }

  if (type === 'purpleMint') {
    bullet.lifeTimer = 120;

    bullet.mx = 0;
    bullet.my = 0;
    bullet.rotSpeed = 0;
  }

  bullets[bullets.length] = bullet;
}

function createItem(world, x, y, type) {
  itemCounter++;
  let item = createSprite('item' + itemCounter, x, y, 25, 25);
  item.world = world;
  item.type = type;

  items[items.length] = item;
}

function createParticle(x, y, velX, velY, world) {
  itemCounter++;

  let particle = createSprite('particle' + itemCounter, x, y, 8, 8);
  particle.mx = Math.random() * 30 - 15 + velX;
  particle.my = Math.random() * 30 - 15 + velY;
  particle.lifeTimer = 300;
  particle.world = world;

  particles[particles.length] = particle;
}


module.exports = (io) => (socket) => {
  socket.on('createChar', function () {
    itemCounter++;
    socket.number = itemCounter;
    io.emit('loadNewChar', socket.number);
  });
  socket.on('createBullet', function (player, bulletType) {
    createBullet(player, bulletType);
  });
  socket.on('playerInfo', function (playerSprite, isMouseDown) {

    let inPlayerArray = false;
    for (i = 0; i < players.length; i++) {
      if (playerSprite.element === players[i].element) {
        inPlayerArray = true;
        players[i] = playerSprite;
      }
    }
    if (inPlayerArray === false) {
      players[players.length] = playerSprite;
    }

    for (i = 0; i < bullets.length; i++) {
      if (bullets[i].type === 'blueMint' && playerSprite.element === bullets[i].owner) {
        if (isMouseDown) {
          let angle = Math.atan2((playerSprite.mouse.y - bullets[i].y), (playerSprite.mouse.x - bullets[i].x)) * (180 / Math.PI);
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

  socket.on('dungeonComplete', function (dungeon) {
    io.emit('playerDungeonComplete', dungeon);
    for (i = 0; i < portals.length; i++) {
      if (portals[i].world === dungeon || portals[i].teleport === dungeon) {
        io.emit('delete', portals[i].element);
        portals.splice(i, 1);
        i--;
      }
    }
    for (i = 0; i < floors.length; i++) {
      if (floors[i].world === dungeon) {
        io.emit('delete', floors[i].element);
        floors.splice(i, 1);
        i--;
      }
    }
    for (i = 0; i < enemies.length; i++) {
      if (enemies[i].world === dungeon) {
        io.emit('delete', enemies[i].element);
        enemies.splice(i, 1);
        i--;
      }
    }
    for (i = 0; i < items.length; i++) {
      if (items[i].world === dungeon) {
        io.emit('delete', items[i].element);
        items.splice(i, 1);
        i--;
      }
    }
    for (i = 0; i < particles.length; i++) {
      if (particles[i].world === dungeon) {
        io.emit('delete', particles[i].element);
        particles.splice(i, 1);
        i--;
      }
    }

    dungeons--;
    if (dungeons < 1) {
      createDungeon('choose', Math.floor(Math.random() * 6) + 5);
    }
  });

  socket.on('hurtEnemy', function (value, bullet) {
    for (i = 0; i < enemies.length; i++) {
      if (enemies[i].element === value) {
        if (enemies[i].lastBulletHit != bullet.element) {
          enemies[i].lastBulletHit = bullet.element;
          enemies[i].hp--;
          if (bullet.type === 'greenOrangeMint') {
            createGreenOrangeMint(bullet);
          }

          createParticle(enemies[i].x, enemies[i].y, enemies[i].mx, enemies[i].my, enemies[i].world);

          if (enemies[i].hp <= 0) {

            if (enemies[i].type === 'skeleton') {
              if (Math.floor(Math.random() * 8) === 0) {
                createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'mint');
              } else {
                if (Math.floor(Math.random() * 8) === 0) {
                  createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'lifeSaver');
                } else {
                  if (Math.floor(Math.random() * 24) === 0) {
                    createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'greenOrangeMint');
                  } else {
                    if (Math.floor(Math.random() * 48) === 0) {
                      createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'limeLifeSaver');
                    }
                  }
                }
              }
            }

            if (enemies[i].type === 'mage') {
              if (Math.floor(Math.random() * 8) === 0) {
                createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'blueMint');
              } else {
                if (Math.floor(Math.random() * 8) === 0) {
                  createItem(enemies[i].world, enemies[i].x, enemies[i].y, 'purpleMint');
                }
              }
            }

            enemies.splice(i, 1);
          }
        }
        break;
      }
    }

    io.emit('delete', value);
  });

  socket.on('hurtEnemyProjectile', function (value) {
    for (i = 0; i < enemyProjectiles.length; i++) {
      if (enemyProjectiles[i].element === value) {
        enemyProjectiles[i].hp--;
        if (enemyProjectiles[i].hp <= 0) {

          enemyProjectiles.splice(i, 1);
        }
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteBullet', function (value) {
    for (i = 0; i < bullets.length; i++) {
      if (bullets[i].element === value) {
        bullets.splice(i, 1);
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteItem', function (value) {
    for (i = 0; i < items.length; i++) {
      if (items[i].element === value) {
        items.splice(i, 1);
      }
    }

    io.emit('delete', value);
  });

  socket.on('deleteForAll', function (value) {
    io.emit('delete', value);
  });

  socket.on('itemDropped', function (world, x, y, type) {
    createItem(world, x, y, type);
  });

  socket.on('disconnect', function () {
    io.emit('delete', socket.number);
    for (i = 0; i < players.length; i++) {
      if (players[i].element === socket.number) {
        players.splice(i, 1);
        i--;
      }
    }
  });


};
