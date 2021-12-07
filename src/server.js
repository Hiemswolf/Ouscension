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

const { startGame } = require('./gameFunctions');

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


startGame();


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
