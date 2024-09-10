module.exports = {
  createGame,
};

const {
  createSprite,
  createDungeon,
  createFloor,
  createBullet,
} = require("./mutualFunctions");
const { io } = require("./server");

function createGame() {
  createFloor("Hub", -250, -250);
  createDungeon("choose", 8);

  const interval = setInterval(loop, 40);
  // Use "clearInterval(interval)" to stop the loop.

  function checkCollision(a, b) {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  }

  function blocker(sprite) {
    if (sprite.preX === undefined || sprite.preX === null) {
      sprite.preX = sprite.x;
      sprite.preY = sprite.Y;
    }

    let onFloor = false;

    for (o = 0; o < floors.length; o++) {
      if (sprite.world === floors[o].world) {
        if (checkCollision(sprite, floors[o])) {
          onFloor = true;
        }
      }
    }

    if (!onFloor) {
      sprite.x = sprite.preX;
      sprite.y = sprite.preY;
    }

    sprite.preX = sprite.x;
    sprite.preY = sprite.y;
  }

  function createEnemyProjectile(source) {
    itemCounter++;
    let size = 10;
    let enemyProjectile = createSprite(
      "enemy" + itemCounter,
      source.x,
      source.y,
      size,
      size
    );
    enemyProjectile.world = source.world;
    enemyProjectile.hp = 1;
    enemyProjectile.angle = source.angle;
    enemyProjectile.lifeTimer = 60;

    enemyProjectile.mx = 14 * Math.cos((enemyProjectile.angle * Math.PI) / 180);
    enemyProjectile.my = 14 * Math.sin((enemyProjectile.angle * Math.PI) / 180);

    enemyProjectiles[enemyProjectiles.length] = enemyProjectile;
  }

  function enemyProjectileHandler() {
    for (i = 0; i < enemyProjectiles.length; i++) {
      enemyProjectiles[i].x += enemyProjectiles[i].mx;
      enemyProjectiles[i].y += enemyProjectiles[i].my;

      enemyProjectiles[i].lifeTimer--;
      if (enemyProjectiles[i].lifeTimer < -1) {
        enemyProjectiles.splice(i, 1);
        i--;
      }
    }
  }

  function enemyHandler() {
    for (i = 0; i < enemies.length; i++) {
      enemies[i].orangeGreenMintSpawns = 0;

      let preX = enemies[i].x;
      let preY = enemies[i].y;

      let targets = [];

      for (j = 0; j < players.length; j++) {
        if (players[j].world === enemies[i].world) {
          let target = players[j];
          target.distance = Math.hypot(
            players[j].x - enemies[i].x,
            players[j].y - enemies[i].y
          );

          targets[targets.length] = target;
        }
      }

      let closestDistance = 800;
      let closest;
      for (j = 0; j < targets.length; j++) {
        if (targets[j].distance < closestDistance) {
          closest = targets[j];
          closestDistance = targets[j].distance;
        }
      }

      if (closest !== undefined) {
        enemies[i].angle =
          Math.atan2(closest.y - enemies[i].y, closest.x - enemies[i].x) *
          (180 / Math.PI);

        if (enemies[i].type === "mage") {
          if (closestDistance > 100) {
            enemies[i].x +=
              enemies[i].speed * Math.cos((enemies[i].angle * Math.PI) / 180);
            blocker(enemies[i]);
            enemies[i].y +=
              enemies[i].speed * Math.sin((enemies[i].angle * Math.PI) / 180);
            blocker(enemies[i]);
          }

          if (closestDistance < 500 && enemies[i].projectileTimer <= 0) {
            enemies[i].projectileTimer = 24;

            createEnemyProjectile(enemies[i]);
          } else {
            enemies[i].projectileTimer--;
          }
        } else {
          enemies[i].x +=
            enemies[i].speed * Math.cos((enemies[i].angle * Math.PI) / 180);
          blocker(enemies[i]);
          enemies[i].y +=
            enemies[i].speed * Math.sin((enemies[i].angle * Math.PI) / 180);
          blocker(enemies[i]);
        }

        for (j = 0; j < enemies.length; j++) {
          if (
            enemies[i].element != enemies[j].element &&
            enemies[i].world === enemies[j].world
          ) {
            let moveX = 10 / (enemies[i].x - enemies[j].x);
            let moveY = 10 / (enemies[i].y - enemies[j].y);

            if (Math.abs(moveX) + Math.abs(moveY) >= 20) {
              moveX = 0;
              moveY = 0;
            }

            enemies[i].x += moveX;
            blocker(enemies[i]);
            enemies[i].y += moveY;
            blocker(enemies[i]);
          }
        }
      }

      enemies[i].mx = enemies[i].x - preX;
      enemies[i].my = enemies[i].y - preY;
    }
  }

  function bulletHandler() {
    for (i = 0; i < bullets.length; i++) {
      bullets[i].x += bullets[i].mx;
      bullets[i].y += bullets[i].my;
      bullets[i].angle += bullets[i].rotSpeed;

      if (bullets[i].type === "purpleMint") {
        let closestDistance = 200;
        let closest;

        let targets = [];

        for (j = 0; j < enemies.length; j++) {
          if (enemies[j].world === bullets[i].world) {
            let target = enemies[j];
            target.distance = Math.hypot(
              enemies[j].x - bullets[i].x,
              enemies[j].y - bullets[i].y
            );

            targets[targets.length] = target;
          }
        }

        for (j = 0; j < enemies.length; j++) {
          if (enemies[j].distance < closestDistance) {
            closest = enemies[j];
            closestDistance = enemies[j].distance;
          }
        }

        if (closest !== undefined) {
          let angle =
            Math.atan2(closest.y - bullets[i].y, closest.x - bullets[i].x) *
            (180 / Math.PI);
          bullets[i].rotSpeed =
            (angle - bullets[i].angle) * 0.05 + bullets[i].rotSpeed * 0.8;
        } else {
          bullets[i].rotSpeed = 0;
        }

        bullets[i].x += 16 * Math.cos((bullets[i].angle * Math.PI) / 180);
        bullets[i].y += 16 * Math.sin((bullets[i].angle * Math.PI) / 180);
      }

      bullets[i].lifeTimer--;
      if (bullets[i].lifeTimer < -1) {
        if (bullets[i].type === "limeLifeSaver") {
          for (j = 0; j < 6; j++) {
            bullets[i].angle += 60;
            createBullet(bullets[i], "lifeSaver");
          }
        }
        if (bullets[i].type === "lifeSaver") {
          for (j = 0; j < 6; j++) {
            bullets[i].angle += 60;
            createBullet(bullets[i], "mint");
          }
        }

        bullets.splice(i, 1);
        i--;
      }
    }
  }

  function particleHandler() {
    for (i = 0; i < particles.length; i++) {
      particles[i].x += particles[i].mx;
      particles[i].y += particles[i].my;
      particles[i].mx = particles[i].mx * 0.8;
      particles[i].my = particles[i].my * 0.8;

      blocker(particles[i]);

      particles[i].lifeTimer--;
      if (particles[i].lifeTimer < -1) {
        particles.splice(i, 1);
        i--;
      }
    }
  }

  function loop() {
    bulletHandler();
    enemyHandler();
    enemyProjectileHandler();
    particleHandler();

    for (i = 0; i < portals.length; i++) {
      portals[i].angle += 9;
    }

    io.emit(
      "loop",
      bullets,
      portals,
      floors,
      enemies,
      items,
      enemyProjectiles,
      particles
    );
  }
}
