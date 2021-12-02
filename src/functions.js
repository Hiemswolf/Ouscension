module.exports = {
    checkCollision,
    createSprite,
    blocker,
    createGreenOrangeMint,
    createBullet,
    createItem,
    createPortal,
    createFloor,
    createEnemy,
    createDungeon,
    enemyHandler,
    createEnemyProjectile,
    createParticle,
    enemyProjectileHandler,
    bulletHandler,
    particleHandler,
    Update
};

function checkCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function createSprite(element, x, y, w, h) {
    let result = new Object();
    result.element = element;
    result.x = x;
    result.y = y;
    result.w = w;
    result.h = h;

    return result;
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

function createPortal(world, teleport, x, y) {
    itemCounter++;
    let portal = createSprite('portal' + itemCounter, x, y, 40, 40);
    portal.world = world;
    portal.teleport = teleport;
    portal.angle = 0;

    portals[portals.length] = portal;
}

function createFloor(world, x, y) {
    itemCounter++;
    let floor = createSprite('floor' + itemCounter, x, y, 500, 500);
    floor.world = world;

    floors[floors.length] = floor;
}

function createEnemy(world, x, y, type) {
    itemCounter++;
    let size = 30;
    let enemy = createSprite('enemy' + itemCounter, x, y, size, size);
    enemy.world = world;
    enemy.hp = 10;
    enemy.type = type;
    enemy.speed = 10;

    if (type === "mage") {
        enemy.speed = 5;
        enemy.projectileTimer = 24;
    }

    enemies[enemies.length] = enemy;
}

function createDungeon(name, length) {
    if (name === 'choose') {
        let names = ['Alpha', 'Beta', 'Delta', 'Zeta', 'Yotta'];
        name = names[Math.floor(Math.random() * 5)];
    }

    createPortal('Hub', name, (Math.floor(Math.random() * 5) - 1) * 60, -100);

    createFloor(name, -250, -250);
    let floorX = 0;
    let floorY = 0;

    for (i = 0; i < length; i++) {
        let change = Math.floor(Math.random() * 4);
        if (change === 0) { floorX++ }
        if (change === 1) { floorX-- }
        if (change === 2) { floorY++ }
        if (change === 3) { floorY-- }
        createFloor(name, floorX * 500 - 250, floorY * 500 - 250);

        for (j = 0; j < Math.floor(Math.random() * 3); j++) {
            createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, 'skeleton');
        }
        if (Math.floor(Math.random() * 3) === 0) {
            createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, 'mage');
        }
    }
    createPortal(name, 'Hub', floorX * 500 - 15, floorY * 500 - 15);
    dungeons++;
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
                target.distance = Math.hypot(players[j].x - enemies[i].x, players[j].y - enemies[i].y);

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
            enemies[i].angle = Math.atan2((closest.y - enemies[i].y), (closest.x - enemies[i].x)) * (180 / Math.PI);

            if (enemies[i].type === "mage") {
                if (closestDistance > 100) {
                    enemies[i].x += enemies[i].speed * Math.cos(enemies[i].angle * Math.PI / 180);
                    blocker(enemies[i]);
                    enemies[i].y += enemies[i].speed * Math.sin(enemies[i].angle * Math.PI / 180);
                    blocker(enemies[i]);
                }

                if (closestDistance < 500 && enemies[i].projectileTimer <= 0) {
                    enemies[i].projectileTimer = 24;

                    createEnemyProjectile(enemies[i]);
                } else {
                    enemies[i].projectileTimer--;
                }
            } else {
                enemies[i].x += enemies[i].speed * Math.cos(enemies[i].angle * Math.PI / 180);
                blocker(enemies[i]);
                enemies[i].y += enemies[i].speed * Math.sin(enemies[i].angle * Math.PI / 180);
                blocker(enemies[i]);
            }

            for (j = 0; j < enemies.length; j++) {
                if (enemies[i].element != enemies[j].element && enemies[i].world === enemies[j].world) {
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

function createEnemyProjectile(source) {
    itemCounter++;
    let size = 10;
    let enemyProjectile = createSprite('enemy' + itemCounter, source.x, source.y, size, size);
    enemyProjectile.world = source.world;
    enemyProjectile.hp = 1;
    enemyProjectile.angle = source.angle;
    enemyProjectile.lifeTimer = 60;

    enemyProjectile.mx = 14 * Math.cos(enemyProjectile.angle * Math.PI / 180);
    enemyProjectile.my = 14 * Math.sin(enemyProjectile.angle * Math.PI / 180);

    enemyProjectiles[enemyProjectiles.length] = enemyProjectile;
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

function bulletHandler() {
    for (i = 0; i < bullets.length; i++) {

        bullets[i].x += bullets[i].mx;
        bullets[i].y += bullets[i].my;
        bullets[i].angle += bullets[i].rotSpeed;

        if (bullets[i].type === 'purpleMint') {
            let closestDistance = 200;
            let closest;

            let targets = [];

            for (j = 0; j < enemies.length; j++) {
                if (enemies[j].world === bullets[i].world) {
                    let target = enemies[j];
                    target.distance = Math.hypot(enemies[j].x - bullets[i].x, enemies[j].y - bullets[i].y);

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
                let angle = Math.atan2((closest.y - bullets[i].y), (closest.x - bullets[i].x)) * (180 / Math.PI);
                bullets[i].rotSpeed = (angle - bullets[i].angle) * 0.05 + bullets[i].rotSpeed * 0.8;
            } else {
                bullets[i].rotSpeed = 0;
            }

            bullets[i].x += 16 * Math.cos(bullets[i].angle * Math.PI / 180);
            bullets[i].y += 16 * Math.sin(bullets[i].angle * Math.PI / 180);
        }

        bullets[i].lifeTimer--;
        if (bullets[i].lifeTimer < -1) {
            if (bullets[i].type === 'limeLifeSaver') {
                for (j = 0; j < 6; j++) {
                    bullets[i].angle += 60;
                    createBullet(bullets[i], 'lifeSaver');
                }
            }
            if (bullets[i].type === 'lifeSaver') {
                for (j = 0; j < 6; j++) {
                    bullets[i].angle += 60;
                    createBullet(bullets[i], 'mint');
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

//loop
function Update() {
    if (lastUpdate + 40 <= new Date().getTime()) {

        bulletHandler();
        enemyHandler();
        enemyProjectileHandler();
        particleHandler();

        for (i = 0; i < portals.length; i++) {
            portals[i].angle += 9;
        }

        io.emit('loop', bullets, portals, floors, enemies, items, enemyProjectiles, particles);

        lastUpdate = new Date().getTime();
    }
    setTimeout(function () { Update(); }, 2);
}



