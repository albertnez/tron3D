var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); // Keyboard for input
// SETTINGS
var SPS = 8; // Steps per second
var CAMERA_SPEED = 3; // Speed of the camera following the player
var CAMERA_DISTANCE = 35; //Distance of the camera from player
var CAMERA_HEIGHT = 18; // Distance of camera from board
var CAMERA_FOLLOW = true; // Follow the player instead of showing the entire map
var MAP_WIDTH = 30; // Map width
var MAP_HEIGHT = 30; // Tiles high of the map
var LIGHTS_ON = false; // not working yet
var SHADOWS_ON = false; // not working yet
var NUM_PLAYERS = 2; // number of player: from 1 to 8.
var RANDOM_START = false; // Players start at random position and direction;

var graphics = new Graphics();
var map = new Map(MAP_WIDTH, MAP_HEIGHT);

var deadPlayers = []; // Array for dead players
//Players
var players = [];


for (var i = 0; i < NUM_PLAYERS; ++i) {
	players[i] = new Player({ 
		id: (i+1),
		bot:(i > 0),
		difficulty: (i%2),
		direction: (RANDOM_START ? Math.floor(Math.random()*4) : 2*(i%2)),
		x: (RANDOM_START ? Math.floor(Math.random()*(MAP_WIDTH-10))+5 : MAP_WIDTH/2),
		y: (RANDOM_START ? Math.floor(Math.random()*(MAP_HEIGHT-10))+5 : MAP_HEIGHT/2-(2*NUM_PLAYERS)+(4*i))
	});
}
// CONTROLS FOR PLAYER 1
players[0].controls = {right:'D', up:'W', left:'A', down:'S', stop:' '};

function update(dt) {
	/*	
		First: Move players
		Second: Check deaths
		Third: Remove players and update map
	*/

	for (var i = players.length-1; i >= 0; --i)	players[i].move();
	for (var i = players.length-1; i >= 0; --i) players[i].checkDeath();
	for (var i = players.length-1; i >= 0; --i) players[i].update();
}

function control() {
	for (var i = players.length-1; i >= 0; --i) players[i].control();
	// LAZY RESTART
	if (kb.char('R')) window.location = window.location;
}

function loop() {
	requestAnimationFrame(loop);
	
	var time = new Date().getTime();
	var dt = (time-oldTime)/1000;
	oldTime = time;

	if (time-oldUpdate > 1000/SPS) {
		update(dt);
		oldUpdate = time;
	}
	control();
	graphics.cameraLogic(dt, players[0]);
	graphics.renderer.render(graphics.scene, graphics.camera);

}
var oldTime = new Date().getTime();
var oldUpdate = 0;
loop();