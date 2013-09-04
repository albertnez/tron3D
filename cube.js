var kb = new KeyboardJS(false/*, function (evt) {evt.preventDefault();}*/); //Keyboard for input
// CONSTANTS
var SPS = 8; //STEPS PER SECOND
var CAMERA_SPEED = 3; //speed of the camera
var CAMERA_DISTANCE = 6; //distance of the camera from player
var CAMERA_HEIGHT = 18; // distance of camera from board
var CAMERA_FOLLOW = false; // follow the player or show the entire board
var MAP_WIDTH = 30; 
var MAP_HEIGHT = 30;
var LIGHTS_ON = false; // not working
var SHADOWS_ON = false; // not working

//GRAPHICS
function Graphics() {
	//SCENE
	this.scene = new THREE.Scene();
		//CAMERA
	this.FOV = 45;
	this.camera = new THREE.PerspectiveCamera( this.FOV, window.innerWidth / window.innerHeight, 0.1, 1000 );
	//RENDERER
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( this.renderer.domElement );

	this.colors = [0x000000, 0xFF0000, 0x00FF00, 0x0000FF];
	this.deadColor = 0x000000;


	if (SHADOWS_ON) {
		this.renderer.shadowMapEnabled = true;
		this.obj = new THREE.Mesh( new THREE.CubeGeometry(5,5,5), new THREE.MeshBasicMaterial({color:'blue'}));
		this.obj.position.x = 7;
		this.obj.position.y = -2;
		this.obj.castShadow = true;
		this.scene.add(this.obj);

		this.c = new THREE.Mesh( new THREE.CubeGeometry(5,5,1), new THREE.MeshBasicMaterial({color:'yellow'}));
		this.c.position.x = 10;
		this.c.position.y = -5;
		this.c.receiveShadow = true;
		this.scene.add(this.c);
	}

	// light for testing
	if (LIGHTS_ON) {
		this.pointLight = new THREE.SpotLight(0xFFFFFF);
		this.pointLight.position.x = 0;
		this.pointLight.position.y = 0;
		this.pointLight.position.z = 3;
		this.pointLight.castShadow = true;
		this.pointLight.shadowDarkness = 0.6;
		this.scene.add(this.pointLight);
	}
	//BOARD
	this.materialsArray = [];
	this.materialsArray.push(new THREE.MeshBasicMaterial({color: 0x000000}));
	this.materialsArray.push(new THREE.MeshBasicMaterial({color: 0xFFFFFF}));

	this.multiMaterial = new THREE.MeshFaceMaterial(this.materialsArray);
	this.planeGeo = new THREE.PlaneGeometry( MAP_WIDTH, MAP_HEIGHT, MAP_WIDTH, MAP_HEIGHT );
	for (var i = 0; 2*i < MAP_WIDTH*MAP_HEIGHT*2; ++i) {
		this.planeGeo.faces[i*2].materialIndex = this.planeGeo.faces[i*2+1].materialIndex = (i+Math.floor(i/MAP_WIDTH)*(MAP_WIDTH+1%2))%2;
	}
	this.plane = new THREE.Mesh( 
		this.planeGeo,
		this.multiMaterial
	);
	this.plane.receiveShadow = (SHADOWS_ON);
	//make the top left tile be at (0,0);
	this.plane.position.x = MAP_WIDTH*0.5-0.5; 
	this.plane.position.y = -MAP_HEIGHT*0.5+0.5;
	this.scene.add(this.plane);
	//END BOARD
	
	//CAMERA SETTINGS
	if (CAMERA_FOLLOW) {
		this.camera.position.x = this.camera.position.y = 5000; // inital effect
		this.camera.rotation.x = 0.38;
		this.camera.position.z = CAMERA_HEIGHT;
	}
	else {
		this.camera.position.x = MAP_WIDTH/2;
		this.camera.position.y = -MAP_HEIGHT/2;
		this.camera.position.z = Math.max(MAP_HEIGHT, MAP_WIDTH)+10;
		//this.camera.position.z = (Math.max(MAP_WIDTH,MAP_HEIGHT)/2)/Math.tan(this.FOV/2);
	}


	//CUBES ARRAY
	this.cubesArray = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) {
		this.cubesArray[i] = [];
		for (var j = 0; j < MAP_WIDTH; ++j) {
			this.cubesArray[i][j] = -1;
		}
	}

	this.cameraLogic = function(dt, p) {
		if (CAMERA_FOLLOW) {
		var speed = SPS/2; // CHECK THIS
		var dist = CAMERA_DISTANCE;
		this.camera.position.x += (p.x - this.camera.position.x)*dt*speed;
		if (this.camera.position.y > -p.y - dist) speed*=2;
		this.camera.position.y += (-p.y - dist - this.camera.position.y)*dt*speed;
		}
		else {

		}
		//CAMERA STUFF
		if (kb.char('Z')) this.camera.position.z += dt*5;
		if (kb.char('X')) this.camera.position.z -= dt*5;
		if (kb.char('R')) this.camera.rotation.x += dt;
		if (kb.char('T')) this.camera.rotation.x -= dt;
	}

	this.update = function(x, y, id, dead) {
		if (this.cubesArray[y][x] === -1) {
			var cube = THREE.SceneUtils.createMultiMaterialObject(
				new THREE.CubeGeometry(1, 1, 0.5), 
				[
    				new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
 					new THREE.MeshBasicMaterial({color: (dead ? this.deadColor : this.colors[id])}) 
 			 	] 
 			);

 			cube.position.x = x;
			cube.position.y = -y;
			cube.position.z = 0.25;

			this.cubesArray[y][x] = cube;
			this.scene.add(this.cubesArray[y][x]);
		}
		else {
			console.log('changing cube at ' + x + ' ' + y);
			this.cubesArray[y][x].children[1].material.color.setHex((dead ? this.deadColor : this.colors[id]));
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


	//Updates map. 
	this.update = function(x, y, id, dead) {
			this.tiles[y][x] = id;
			graphics.update(x,y,id,dead)
	}
}
//create the map
var map = new Map(MAP_WIDTH, MAP_HEIGHT);

//PLAYER
function Player(obj) {
	for (var prop in obj) this[prop] = obj[prop];
}

Player.prototype = {
	id: 1,
	bot: false,
	x: 0,
	y: 0,
	dead: false,
	c: 'red',
	direction: 0,
	lastMove: -1,
	controls: {up:'W', left:'A', down:'S', right:'D', stop:'E'},
	dx: [1,0,-1,0],
	dy: [0,-1,0,1]

}

Player.prototype.IA = function() {
	var ty = this.y + this.dy[this.direction], tx = this.x + this.dx[this.direction];
	console.log('x: ' + this.x + ' y: ' + this.y + '\ntx: ' + tx + ' ty: ' + ty);
	if (ty < 0 || ty >= MAP_HEIGHT || tx < 0 || tx >= MAP_WIDTH || map.tiles[ty][tx]) {
		console.log('crash at ' + this.x + ' ' + this.y);
		var tmp = (this.direction+1)%4;
		ty = this.y + this.dy[tmp];
		tx = this.x + this.dx[tmp];
		if (ty >= 0 && ty < MAP_HEIGHT && tx >= 0 && tx < MAP_WIDTH && !map.tiles[ty][tx]) this.direction = tmp;
		else this.direction = (this.direction+3)%4;
	}
}

Player.prototype.update = function() {
	if (!this.dead) {
		if (this.bot) this.IA();
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
		if (map.tiles[this.y][this.x]) {
			this.dead = true;
			this.direction = -1;
		}
		this.lastMove = this.direction;
		map.update(this.x, this.y, this.id, this.dead);
	}
}

Player.prototype.control = function(dt) {
	if (!this.dead) {
		if (kb.char(this.controls.up) && this.lastMove != 3) this.direction = 1;
		if (kb.char(this.controls.left) && this.lastMove != 0) this.direction = 2;
		if (kb.char(this.controls.down) && this.lastMove != 1) this.direction = 3;
		if (kb.char(this.controls.right) && this.lastMove != 2) this.direction = 0;
		if (kb.char(this.controls.stop)) this.direction = -1;
	}
}

//Players
var players = [
	new Player({id:1, color: 0xFF0000, direction: 2, x: MAP_WIDTH/2-1, y: MAP_HEIGHT/2-1}), 
	new Player({
		id:2, bot:true, color: 0x00FF00, direction: 0, x: MAP_WIDTH/2+1, y: MAP_HEIGHT/2-1,
		controls : {up:'I',left:'J',down:'K',right:'L',stop:'U'}
	})
];

function update(dt) {
	for (var i = players.length-1; i >= 0; --i)	players[i].update(dt);
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

	control();
	
	graphics.cameraLogic(dt, players[0]);

	graphics.renderer.render(graphics.scene, graphics.camera);
}

var oldTime = new Date().getTime();
var oldUpdate = 0;
loop();