const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use('/', express.static(path.join(__dirname, '../public')));

const {
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
  enemyProjectHandler,
  bulletHandler,
  particleHandler,
  Update
} = require('./functions');

itemCounter = 0;
lastUpdate = new Date().getTime();
players = [];
bullets = [];
portals = [];
floors = [];
enemies = [];
items = [];
enemyProjectiles = [];
particles = [];
dungeons = 0;

const handleSocket = require('./socketHandler')(io);
io.on('connection', handleSocket);

createFloor('Hub', -250, -250);
createDungeon('choose', 8);
Update();


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
