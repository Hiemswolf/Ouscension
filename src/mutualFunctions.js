module.exports = {
  createDungeon,
  createSprite,
  createFloor,
  createBullet,
};

function createBullet(player, type) {
  itemCounter++;

  let bullet = createSprite(
    itemCounter,
    player.x + player.w / 2,
    player.y + player.h / 2,
    5,
    5
  );
  bullet.angle = player.angle;
  bullet.world = player.world;
  if (player.owner != undefined) {
    bullet.owner = player.owner;
  } else {
    bullet.owner = player.element;
  }
  bullet.type = type;

  if (type === "mint") {
    bullet.mx = 16 * Math.cos((bullet.angle * Math.PI) / 180);
    bullet.my = 16 * Math.sin((bullet.angle * Math.PI) / 180);
    bullet.rotSpeed = 0;

    bullet.lifeTimer = 60;
  }

  if (type === "greenOrangeMint") {
    bullet.mx = 8 * Math.cos((bullet.angle * Math.PI) / 180);
    bullet.my = 8 * Math.sin((bullet.angle * Math.PI) / 180);
    bullet.rotSpeed = 0;

    bullet.lifeTimer = 60;
  }

  if (type === "lifeSaver" || type === "limeLifeSaver") {
    bullet.lifeTimer = 40;

    bullet.mx = 6 * Math.cos((bullet.angle * Math.PI) / 180);
    bullet.my = 6 * Math.sin((bullet.angle * Math.PI) / 180);
    bullet.rotSpeed = (360 + Math.random() * 60) / bullet.lifeTimer;
  }

  if (type === "blueMint") {
    bullet.lifeTimer = 180;

    bullet.mx = 0;
    bullet.my = 0;
    bullet.rotSpeed = 0;
  }

  if (type === "purpleMint") {
    bullet.lifeTimer = 120;

    bullet.mx = 0;
    bullet.my = 0;
    bullet.rotSpeed = 0;
  }

  bullets.push(bullet);
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

function createFloor(world, x, y) {
  itemCounter++;
  let floor = createSprite("floor" + itemCounter, x, y, 500, 500);
  floor.world = world;

  floors[floors.length] = floor;
}

function createDungeon(name, length) {
  if (name === "choose") {
    let names = ["Alpha", "Beta", "Delta", "Zeta", "Yotta"];
    name = names[Math.floor(Math.random() * 5)];
  }

  createPortal("Hub", name, (Math.floor(Math.random() * 5) - 1) * 60, -100);

  createFloor(name, -250, -250);
  let floorX = 0;
  let floorY = 0;

  for (i = 0; i < length; i++) {
    let change = Math.floor(Math.random() * 4);
    if (change === 0) {
      floorX++;
    }
    if (change === 1) {
      floorX--;
    }
    if (change === 2) {
      floorY++;
    }
    if (change === 3) {
      floorY--;
    }
    createFloor(name, floorX * 500 - 250, floorY * 500 - 250);

    for (j = 0; j < Math.floor(Math.random() * 3); j++) {
      createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, "skeleton");
    }
    if (Math.floor(Math.random() * 3) === 0) {
      createEnemy(name, floorX * 500 - 15, floorY * 500 - 15, "mage");
    }
  }
  createPortal(name, "Hub", floorX * 500 - 15, floorY * 500 - 15);
  dungeons++;
}

function createPortal(world, teleport, x, y) {
  itemCounter++;
  let portal = createSprite("portal" + itemCounter, x, y, 40, 40);
  portal.world = world;
  portal.teleport = teleport;
  portal.angle = 0;

  portals[portals.length] = portal;
}

function createEnemy(world, x, y, type) {
  itemCounter++;
  let size = 30;
  let enemy = createSprite("enemy" + itemCounter, x, y, size, size);
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
