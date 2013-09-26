
/*	-----------
      Tron.js
	-----------
*/

var kb = new KeyboardJS(false); // Keyboard for input

function GameSettings (conf) {
	for (var prop in conf) this[prop] = conf[prop];
}

GameSettings.prototype = {
	SPS : 8, // Steps per second
	CAMERA_SPEED : 3, // Speed of the camera following the player
	CAMERA_DISTANCE : 35, //Distance of the camera from player
	CAMERA_HEIGHT : 18, // Distance of camera from board
	CAMERA_FOLLOW : true, // Follow the player instead of showing the entire map
	MAP_WIDTH : 30, // Map width
	MAP_HEIGHT : 30, // Tiles high of the map
	LIGHTS_ON : false, // not working yet
	SHADOWS_ON : false, // not working yet
	NUM_PLAYERS : 8, // number of player: from 1 to 8
	NUM_HUMANS : 1, // for now, from 0 to 2.
	RANDOM_START : true // Players start at random position and direction;
}

function Game (settings) {
	this.CONF = settings || new GameSettings ();
	this.lastUpdate = new Date().getTime();
	this.graphics = new Graphics (this.CONF);
	this.map = new Map (this.CONF.MAP_WIDTH, this.CONF.MAP_HEIGHT);
	this.setPlayers();
	this.playerStep();
}

Game.prototype.setPlayers = function () {
	this.players = [];
	for (var i = 0; i < this.CONF.NUM_PLAYERS; ++i) this.players[i] = new Player (i, this.CONF);
}

Game.prototype.restart = function () {
	this.graphics.restart();
	this.map.restart();
	this.setPlayers();
	this.playerStep();
}

Game.prototype.playerStep = function () {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].update(this.map, this.graphics);
}

Game.prototype.update = function (time) {
	this.lastUpdate = time;
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].move(this.map);
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].checkDeath(this.map, this.players);
	this.playerStep();
}

Game.prototype.control = function () {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].control();
	if (kb.char('R')) this.restart();
}

Game.prototype.logic = function (time, dt) {
	if (time-this.lastUpdate > 1000/this.CONF.SPS) this.update(time);
	this.control();
	this.graphics.cameraLogic(dt, this.players[0]);
	this.graphics.render();
}

var games = [new Game()];
var oldTime = new Date().getTime();

function loop() {
	requestAnimationFrame(loop);
	var time = new Date().getTime();
	var dt = (time-oldTime)/1000;
	oldTime = time;
	for (var i = 0; i < games.length; ++i) games[i].logic(time, dt);
}

loop();