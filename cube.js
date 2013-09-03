var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); //Keyboard for input
// CONSTANTS
var SPS = 8; //STEPS PER SECOND
var CAMERA_SPEED = 3; //speed of the camera
var CAMERA_DISTANCE = 6;
var CAMERA_HEIGHT = 18;
var MAP_WIDTH = 40;
var MAP_HEIGHT = 40;
var LIGHTS_ON = false;
//SCENE
var scene = new THREE.Scene();
//CAMERA
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//RENDERER
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//GRAPHICS
function Graphics() {
// light for testing
	if (LIGHTS_ON) {
		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.x = 0;
		pointLight.position.y = 0;
		pointLight.position.z = 10;
		scene.add(pointLight);
	}

	//BOARD
	this.materialsArray = [];
	this.materialsArray.push(new THREE.MeshBasicMaterial({color:0x000000}));
	this.materialsArray.push(new THREE.MeshBasicMaterial({color:0xFFFFFF}));

	this.multiMaterial = new THREE.MeshFaceMaterial(this.materialsArray);
	this.planeGeo = new THREE.PlaneGeometry( MAP_WIDTH, MAP_HEIGHT, MAP_WIDTH, MAP_HEIGHT );
	for (var i = 0; 2*i < MAP_WIDTH*MAP_HEIGHT*2; ++i) {
		this.planeGeo.faces[i*2].materialIndex = this.planeGeo.faces[i*2+1].materialIndex = (i+Math.floor(i/MAP_WIDTH))%2;
	}
	this.plane = new THREE.Mesh( 
		this.planeGeo,
		this.multiMaterial
	);
	//make the top left tile be at (0,0);
	this.plane.position.x = MAP_WIDTH*0.5-0.5; 
	this.plane.position.y = -MAP_HEIGHT*0.5+0.5;
	scene.add(this.plane);
	//END BOARD
	
	//CAMERA SETTINGS
	camera.position.z = CAMERA_HEIGHT; // distance from floor
	camera.position.x = camera.position.y = 5000; // inital effect
	camera.rotation.x = 0.38;


	//CUBES ARRAY
	this.cubesArray = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) {
		this.cubesArray[i] = [];
		for (var j = 0; j < MAP_WIDTH; ++j) {
			this.cubesArray[i][j] = -1;
		}
	}

	this.cameraLogic = function(dt, p) {
		var speed = SPS/2; // CHECK THIS
		var dist = CAMERA_DISTANCE;
		camera.position.x += (p.x - camera.position.x)*dt*speed;
		if (camera.position.y > -p.y - dist) speed*=2;
		camera.position.y += (-p.y - dist - camera.position.y)*dt*speed;
		//CAMERA STUFF
		if (kb.char('Z')) camera.position.z += dt*5;
		if (kb.char('X')) camera.position.z -= dt*5;
		if (kb.char('R')) camera.rotation.x += dt;
		if (kb.char('T')) camera.rotation.x -= dt;
	}

	this.update = function(x, y, c) {
		if (this.cubesArray[y][x] === -1) {
			//this.cubesArray[y][x] = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshBasicMaterial({color:c, wireframe:true}));
			var cube = THREE.SceneUtils.createMultiMaterialObject(
				new THREE.CubeGeometry(1, 1, 0.5), 
				[
    				new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
 					new THREE.MeshBasicMaterial({color: c}) 
 			 	] 
 			);

 			cube.position.x = x;
			cube.position.y = -y;
			cube.position.z = 0.25;
			this.cubesArray[y][x] = cube;
			scene.add(this.cubesArray[y][x]);
		}
		else {
			this.cubesArray[y][x].children[1].material.color.setHex(c);
		}
	}
}
var graphics = new Graphics();

//MAP
function Map(width, height) {
	this.tiles = [];
	for (var y = 0; y < height; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < width; ++x) {
			this.tiles[y][x] = 0;
		}
	}

	this.width = width;
	this.height = height;

	this.update = function(x, y, id) {
		if (this.tiles[y][x] == 0) {
			this.tiles[y][x] = id;
		}
	}
}
//create the map
var map = new Map(MAP_WIDTH, MAP_HEIGHT);

//PLAYER
function Player(id, color, controls) {
	this.id = (id ? id : 1);
	this.x = 0;
	this.y = 0;
	this.c = (color ? color : 'red');
	this.direction = -1;
	this.controls = (controls ? controls : {up:'W',left:'A',down:'S',right:'D',stop:' '});
}

Player.prototype.update = function() {
	switch(this.direction) {
		case 0: 
			if (this.x < MAP_WIDTH-1) ++this.x;
			else this.direction = -1;
		break;
		case 1:
			if (this.y > 0) --this.y;
			else this.direction = -1;
		break;
		case 2:
			if (this.x > 0) --this.x;
			else this.direction = -1;
		break;
		case 3:
			if (this.y < MAP_HEIGHT-1) ++this.y;
			else this.direction = -1;
		break;
	}
	map.update(this.x, this.y, this.c);
	graphics.update(this.x, this.y, this.c);
}

Player.prototype.control = function(dt) {
	if (kb.char(this.controls.up)) this.direction = 1;
	if (kb.char(this.controls.left)) this.direction = 2;
	if (kb.char(this.controls.down)) this.direction = 3;
	if (kb.char(this.controls.right)) this.direction = 0;
	if (kb.char(this.controls.stop)) this.direction = -1;
}

//Players
var players = [new Player(1, 0xFF0000), new Player(2, 0x00FF00, {up:'I',left:'J',down:'K',right:'L',stop:' '})];

function update(dt) {
	for (var i = players.length-1; i >= 0; --i)	players[i].update(dt);
}

function control() {
	for (var i = players.length-1; i >= 0; --i) players[i].control();
}

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
	
	graphics.cameraLogic(dt, players[0]);

	renderer.render(scene, camera);
}

var oldTime = new Date().getTime();
var oldUpdate = 0;
render();