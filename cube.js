var kb = new KeyboardJS(false, function (evt) {evt.preventDefault();});
// CONSTANTS
var SPS = 5; //STEPS PER SECOND
var CAMERA_SPEED = 2; //speed of the camera
var CAMERA_DISTANCE = 3;


//SCENE
var scene = new THREE.Scene();
//CAMERA
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//RENDERER
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//ADD FLOOR
/*
var material = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('texture.jpg') });
var floor = new THREE.Mesh( new THREE.PlaneGeometry(10,10), new THREE.MeshBasicMaterial(material));
scene.add(floor);
*/
// each square
var numW = 40; // number of tiles wide
var numH = 40; // number of tiles high
var planeWidth = 1; // how many wide 
var planeHeight = 1; // how many tall 
var plane = new THREE.Mesh( new THREE.PlaneGeometry( numW*planeWidth, numH*planeHeight, numW, numH ), new   THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ) );
plane.position.x = plane.position.y = 0.5;
scene.add(plane);


//var cube = new THREE.Mesh( new THREE.CubeGeometry(1,2,1), new THREE.MeshLambertMaterial( { color: 0x00ff00 } ) );
//scene.add( cube );

function Player() {
	this.cube = new THREE.Mesh( new THREE.CubeGeometry(1,1,1), new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
	this.cube.position.z = 0.5; // avoid being inside surface
	scene.add(this.cube);
	this.direction = -1;
	this.speed = 2;

	this.logic = function() {
		switch(this.direction) {
			case 0: ++this.cube.position.x; break;
			case 1: ++this.cube.position.y; break;
			case 2: --this.cube.position.x; break;
			case 3: --this.cube.position.y; break;
		}
	}

	this.control = function(dt) {
		if (kb.char('W')) this.direction = 1;
		if (kb.char('A')) this.direction = 2;
		if (kb.char('S')) this.direction = 3;
		if (kb.char('D')) this.direction = 0;
		if (kb.char(' ')) this.direction = -1;
	}
}

player = new Player();

function cameraLogic(dt, p) {
	var speed = CAMERA_SPEED;
	var dist = CAMERA_DISTANCE;
	if (camera.position.x-speed*dt > p.cube.position.x) camera.position.x -= speed*dt;
	if (camera.position.x+speed*dt < p.cube.position.x) camera.position.x += speed*dt;
	if (camera.position.y-speed*dt > p.cube.position.y - dist) camera.position.y -= speed*dt*2.5;
	if (camera.position.y+speed*dt < p.cube.position.y - dist) camera.position.y += speed*dt;
}

// create a point light
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;
scene.add(pointLight);

camera.position.z = 10; // distance from floor
camera.rotation.x = 0.7;


function logic(dt) {
	player.logic(dt);
	if (kb.char('Z')) camera.position.z += dt*5;
	if (kb.char('X')) camera.position.z -= dt*5;
	if (kb.char('R')) camera.rotation.x += dt;
	if (kb.char('T')) camera.rotation.x -= dt;
	if (kb.char('L')) {
		console.log('info\ncampz: ' + camera.position.z + '\ncamrx: '+camera.rotation.x);
	}
}

function render() {
	requestAnimationFrame(render);
	var time = new Date().getTime();
	var dt = (time-oldTime)/1000;
	oldTime = time;

	if (time-oldLogic > 1000/SPS) {
		logic(dt);
		oldLogic = time;
	}
	else {
	}

	player.control();
	cameraLogic(dt, player);

	renderer.render(scene, camera);
}

var oldTime = new Date().getTime();
var oldLogic = 0;
render();