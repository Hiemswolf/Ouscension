const express = require('express');
const app = require('express')();

app.use('/', express.static(__dirname + '/client'));

const Game = require('./game');
new Game(app);
