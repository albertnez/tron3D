var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); // Keyboard for input
// SETTINGS
var SPS = 8; // Steps per second
var CAMERA_SPEED = 3; // Speed of the camera following the player
var CAMERA_DISTANCE = 35; //Distance of the camera from player
var CAMERA_HEIGHT = 18; // Distance of camera from board
var CAMERA_FOLLOW = false; // Follow the player instead of showing the entire map
var MAP_WIDTH = 30; // Map width
var MAP_HEIGHT = 30; // Tiles high of the map
var LIGHTS_ON = false; // not working yet
var SHADOWS_ON = false; // not working yet
var NUM_PLAYERS = 2; // number of player: from 1 to 8.
var RANDOM_START = false; // Players start at random position and direction;

function Game() {
	this.graphics = new Graphics();
	this.map = new Map(MAP_WIDTH, MAP_HEIGHT);
	this.players = [];
	this.setPlayers();
	this.updateTime = new Date().getTime();
	this.oldTime = this.updateTime;
}

Game.prototype.setPlayers = function() {
	this.players = [];
	for (var i = 0; i < NUM_PLAYERS; ++i) {
		this.players[i] = new Player({ 
			id: (i+1),
			bot:(i > 0),
			difficulty: (i%2),
			direction: (RANDOM_START ? Math.floor(Math.random()*4) : 2*(i%2)),
			x: (RANDOM_START ? Math.floor(Math.random()*(MAP_WIDTH-10))+5 : MAP_WIDTH/2),
			y: (RANDOM_START ? Math.floor(Math.random()*(MAP_HEIGHT-10))+5 : MAP_HEIGHT/2-(2*NUM_PLAYERS)+(4*i))
		});
	}
	this.players[0].controls = {right:'D', up:'W', left:'A', down:'S', stop:' '};

}

Game.prototype.restart = function() {
	this.graphics.restart();
	this.map.restart();
	this.setPlayers();

}
// CONTROLS FOR PLAYER 1

Game.prototype.update = function() {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].move(this.map);
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].checkDeath(this.map, this.players);
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].update(this.map, this.graphics);
}

Game.prototype.control = function() {
	for (var i = this.players.length-1; i >= 0; --i) this.players[i].control();
	// LAZY RESTART
	if (kb.char('R')) window.location = window.location;
}

var game = new Game();
for (var i = game.players.length-1; i >= 0; --i) game.players[i].update(game.map, game.graphics);

function loop() {
	requestAnimationFrame(loop);
	
	var time = new Date().getTime();
	var dt = (time-game.oldTime)/1000;


	if (time-game.updateTime > 1000/SPS) {
		game.update(dt);
		game.updateTime = time;
	}

	game.control();
	game.graphics.cameraLogic(dt, game.players[0]);
	game.graphics.renderer.render(game.graphics.scene, game.graphics.camera);
}

loop();
