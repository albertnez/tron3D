var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); // Keyboard for input

function GameSettings (conf) {
	for (var prop in conf) this[prop] = conf[prop];
}

GameSettings.prototype = {
	SPS : 8, // Steps per second
	CAMERA_SPEED : 3, // Speed of the camera following the player
	CAMERA_DISTANCE : 35, //Distance of the camera from player
	CAMERA_HEIGHT : 18, // Distance of camera from board
	CAMERA_FOLLOW : false, // Follow the player instead of showing the entire map
	MAP_WIDTH : 30, // Map width
	MAP_HEIGHT : 30, // Tiles high of the map
	LIGHTS_ON : false, // not working yet
	SHADOWS_ON : false, // not working yet
	NUM_PLAYERS : 4, // number of player: from 1 to 8
	NUM_HUMANS : 1, // for now, from 0 to 2.
	RANDOM_START : true // Players start at random position and direction;
}

function Game (settings) {
	this.CONF = settings || new GameSettings ();
	this.graphics = new Graphics (this.CONF);
	this.map = new Map (this.CONF.MAP_WIDTH, this.CONF.MAP_HEIGHT);
	this.setPlayers();
	this.updateTime = new Date().getTime();
	this.oldTime = this.updateTime;
}

Game.prototype.setPlayers = function() {
	this.players = [];
	var CONF = this.CONF;
	for (var i = 0; i < CONF.NUM_PLAYERS; ++i) {
		this.players[i] = new Player (i, CONF);
	}
}

Game.prototype.restart = function() {
	this.graphics.restart();
	this.map.restart();
	this.setPlayers();
	for (var i = game.players.length-1; i >= 0; --i) game.players[i].update(game.map, game.graphics);
}

Game.prototype.update = function() {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].move(this.map);
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].checkDeath(this.map, this.players);
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].update(this.map, this.graphics);
}

Game.prototype.control = function() {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].control();
	//RESTART
	if (kb.char('R')) this.restart();
}

var game = new Game();
for (var i = game.players.length-1; i >= 0; --i) game.players[i].update(game.map, game.graphics);

function loop() {
	requestAnimationFrame(loop);
	
	var time = new Date().getTime();
	var dt = (time-game.oldTime)/1000;
	game.oldTime = time;

	if (time-game.updateTime > 1000/game.CONF.SPS) {
		game.update();
		game.updateTime = time;
	}

	game.control();
	game.graphics.cameraLogic(dt, game.players[0]);
	game.graphics.renderer.render(game.graphics.scene, game.graphics.camera);
}
loop();