var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); //Keyboard for input
// CONSTANTS
var SPS = 8; //STEPS PER SECOND
var CAMERA_SPEED = 3; //speed of the camera
var CAMERA_DISTANCE = 35; //distance of the camera from player
var CAMERA_HEIGHT = 18; // distance of camera from board
var CAMERA_FOLLOW = true; // follow the player or show the entire board
var MAP_WIDTH = 30; // Tiles wide of the map
var MAP_HEIGHT = 30; // Tiles high of the map
var LIGHTS_ON = false; // not working yet
var SHADOWS_ON = false; // not workingyet
var NUM_PLAYERS = 6; //1 to 8.
var RANDOM_START = true; //Start at random position and direction;

var graphics = new Graphics();
var map = new Map(MAP_WIDTH, MAP_HEIGHT);

var deadPlayers = []; // Array for dead players
//Players
var players = [];
players[0] = new Player({id:1, direction: 0, x: MAP_WIDTH/2, y: MAP_HEIGHT/2});
for (var i = 1; i < NUM_PLAYERS; ++i)
	players[i] = new Player({ id: (i+1), bot:true, difficulty: (i%2), direction: 2*(i%2), x: MAP_WIDTH/2, y: MAP_HEIGHT/2+(2*i)});

if (RANDOM_START) {
	for (var i = 0; i < NUM_PLAYERS; ++i) {
		players[i].x = players[i].startX = Math.floor(Math.random()*(MAP_WIDTH-10))+5;
		players[i].y = players[i].startY = Math.floor(Math.random()*(MAP_HEIGHT-10))+5;
		players[i].direction = Math.floor(Math.random()*4);
	}
}

function update(dt) {
	for (var i = players.length-1; i >= 0; --i)	players[i].move();
	for (var i = deadPlayers.length-1; i >= 0; --i) {
		map.remove(deadPlayers[i].x, deadPlayers[i].y, deadPlayers[i].id);
		deadPlayers.slice(i, 1);
	}
}

function control() {
	for (var i = players.length-1; i >= 0; --i) players[i].control();
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

	// LAZY RESTART
	if (kb.char('R')) window.location = window.location;
	control();
	graphics.cameraLogic(dt, players[0]);
	graphics.renderer.render(graphics.scene, graphics.camera);
}
var oldTime = new Date().getTime();
var oldUpdate = 0;
loop();