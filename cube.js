var kb = new KeyboardJS(false, function (evt) {evt.preventDefault();});
// CONSTANTS
var SPS = 5; //STEPS PER SECOND
var CAMERA_SPEED = 3; //speed of the camera
var CAMERA_DISTANCE = 6;
var CAMERA_SMOOTH = 5;


//SCENE
var scene = new THREE.Scene();
//CAMERA
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//RENDERER
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// BOARD PROPERTIES
var numW = 10; // number of tiles wide
var numH = 10; // number of tiles high
var tileWidth = 1; // how many wide 
var tileHeight = 1; // how many tall 

//Materials with basic colors
var materialWire  = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true}); // matIdx = 0
var materialInvisible = new THREE.MeshBasicMaterial({visible:false});
var materialBlack = new THREE.MeshBasicMaterial({color:0x000000});
var materialWhite = new THREE.MeshBasicMaterial({color:0xFFFFFF});
var materialRed   = new THREE.MeshBasicMaterial({color:0xFF0000}); 
var materialGreen = new THREE.MeshBasicMaterial({color:0x00FF00}); 

// Each tile has a material assigned to it.
var materialsArray = [numH*numW];
for (var i = numW-1; i >= 0; --i) {
	for (var j = numH-1; j >= 0; --j) {
		materialsArray[i+j*numW] = ((i+j)%2 ? materialBlack : materialWhite);
	}
}
var multiMaterial = new THREE.MeshFaceMaterial( materialsArray );

var planeGeo = new THREE.PlaneGeometry( numW*tileWidth, numH*tileHeight, numW, numH );
for (var i = 0; 2*i < numW*numH*2; ++i) {
	planeGeo.faces[i*2].materialIndex = planeGeo.faces[i*2+1].materialIndex = i;
}
var plane = new THREE.Mesh( 
	planeGeo,
	multiMaterial
);
//make the top left tile be at (0,0);
plane.position.x = numW*tileWidth*0.5-0.5; 
plane.position.y = -numH*tileHeight*0.5+0.5;
scene.add(plane);


function Player(_color) {
	this.c = _color;
	this.cube = new THREE.Mesh(
		new THREE.CubeGeometry(1,1,1),
		new THREE.MeshLambertMaterial( { color: (_color  ? _color :0xff0000) })
	);
	this.cube.position.z = 0.5; // avoid being inside surface
	scene.add(this.cube);
	this.direction = -1;
	this.speed = 2;

	this.update = function() {
		switch(this.direction) {
			case 0: 
				if (this.cube.position.x < numW-1) ++this.cube.position.x; 
				else this.direction = -1;
			break;
			case 1:
				if (this.cube.position.y < 0) ++this.cube.position.y;
				else this.direction = -1;
			break;
			case 2:
				if (this.cube.position.x > 0) --this.cube.position.x;
				else this.direction = -1;
			break;
			case 3:
				if (this.cube.position.y > -numH+1) --this.cube.position.y;
				else this.direction = -1;
			break;
		}
		materialsArray[this.cube.position.x+this.cube.position.y*-1*numW] = (this.c === 'green' ? materialGreen : materialRed);
	}

	this.control = function(dt) {
		if (kb.char('W')) this.direction = 1;
		if (kb.char('A')) this.direction = 2;
		if (kb.char('S')) this.direction = 3;
		if (kb.char('D')) this.direction = 0;
		if (kb.char(' ')) this.direction = -1;
	}
}

var player = new Player('red');
//Oponent for testing
var op = new Player('green');

op.control = function(dt) { //for testing purposes
		if (kb.char('I')) this.direction = 1;
		if (kb.char('J')) this.direction = 2;
		if (kb.char('K')) this.direction = 3;
		if (kb.char('L')) this.direction = 0;
		if (kb.char(' ')) this.direction = -1;
}
op.cube.position.x = 2;
scene.add(op.cube)

function cameraLogic(dt, p) {
	if (p === undefined) p = player;
	var speed = SPS/2; // CHECK THIS
	var dist = CAMERA_DISTANCE;
	camera.position.x += (p.cube.position.x - camera.position.x)*dt*speed;
	if (camera.position.y > p.cube.position.y - dist) speed*=2;
	camera.position.y += (p.cube.position.y - dist - camera.position.y)*dt*speed;
}

// create a point light
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 10;
scene.add(pointLight);

camera.position.z = 10; // distance from floor
camera.position.x = camera.position.y = 5000; // inital effect
camera.rotation.x = 0.7;

var players = [player, op];
var map = []; //actual map
for (var i = 0; i < numH*numW; ++i) {
	map[i] = new THREE.Mesh( new THREE.CubeGeometry(1,1,0.5), materialInvisible	);
	map[i].position.z = 0.25;
	map[i].position.x = i%numW;
	map[i].position.y = -Math.floor(i/numW);
	scene.add(map[i]);
}


function update(dt) {
	for (var i = players.length-1; i >= 0; --i) {
		map[players[i].cube.position.x+players[i].cube.position.y*-1*numW].material = new THREE.MeshBasicMaterial({color:players[i].c});
		players[i].update(dt);
	}
}
function control() {
	for (var i = players.length-1; i >= 0; --i) players[i].control();
}

var focusPlayer = true;
var focusChanged = false;

function render() {
	requestAnimationFrame(render);
	var time = new Date().getTime();
	var dt = (time-oldTime)/1000;
	oldTime = time;

	if (time-oldUpdate > 1000/SPS) {
		update(dt);
		oldUpdate = time;
	}

	control();

	if (kb.char('B') && !focusChanged) {
		focusPlayer = !focusPlayer;
		focusChanged = true;
	}
	else if (!kb.char('B')) focusChanged = false;

	//CAMERA STUFF
	if (kb.char('Z')) camera.position.z += dt*5;
	if (kb.char('X')) camera.position.z -= dt*5;
	if (kb.char('R')) camera.rotation.x += dt;
	if (kb.char('T')) camera.rotation.x -= dt;
	
	if (focusPlayer) cameraLogic(dt, player);
	else cameraLogic(dt, op);

	renderer.render(scene, camera);
}

var oldTime = new Date().getTime();
var oldUpdate = 0;
render();