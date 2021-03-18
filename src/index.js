const express = require('express');
const app = require('express')();

app.use('/', express.static(__dirname + '/public'));

const Game = require('./game');
new Game(app);