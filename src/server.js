const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});
app.use('/', express.static(path.join(__dirname, '../public')));


module.exports = {
  io
};

const { createGame } = require('./gameFunctions');

itemCounter = 0;
players = [];
bullets = [];
portals = [];
floors = [];
enemies = [];
items = [];
enemyProjectiles = [];
particles = [];
dungeons = 0;

const handleSocket = require('./handleSocket');
io.on('connection', handleSocket);


createGame();


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
