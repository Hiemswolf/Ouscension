const app = require('express')();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const Game = require('./game');
new Game(app);