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
var NUM_PLAYERS = 2; //1 to 6.
var RANDOM_START = true; //Start at random position and direction;

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

	//Array with players'colors. needs to change
	this.colors = [
		0x000000, //BLACK
		0xFF0000, //RED
		0x00FF00, //GREN
		0x0000FF, //BLUE
		0x922BC2, //PURPLE
	 	0xFFFF00, //YELLOW
	 	0x00FFFF, //AQUA
	 	0xFF4AD2, //PINK
	 	0XAAAAAA //GREY
	 ];
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
		this.camera.rotation.x = 0.38;
		this.camera.position.z = CAMERA_HEIGHT;
	}
	else {
		this.camera.position.x = MAP_WIDTH/2;
		this.camera.position.y = -MAP_HEIGHT/2;
		this.camera.position.z = Math.max(MAP_HEIGHT, MAP_WIDTH)*1.1+10;
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

		//CAMERA DEBUG STUFF
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
	if (this.bot) this.controls = {};
}

Player.prototype = {
	id: 1,
	bot: false,
	difficulty: 0,
	x: 0,
	y: 0,
	dead: false,
	c: 'red',
	direction: 0,
	lastMove: -1,
	controls: {up:'W', left:'A', down:'S', right:'D', stop:'E'},
	dx: [1,0,-1,0],
	dy: [0,-1,0,1], 
	arrayAI: [],
}

Player.prototype.AI = function() {
	console.log('running IA from ' + this.id);
	this.arrayAI[this.difficulty](this);
}

// NOOB AI
Player.prototype.arrayAI[0] = function(self) {
	var ty = self.y + self.dy[self.direction], tx = self.x + self.dx[self.direction];
	if (ty < 0 || ty >= MAP_HEIGHT || tx < 0 || tx >= MAP_WIDTH || map.tiles[ty][tx] > 0) {
		var tmp = (self.direction+1)%4;
		ty = self.y + self.dy[tmp];
		tx = self.x + self.dx[tmp];
		var d1 = 0, d2 = 0;
		while (ty >= 0 && ty < MAP_HEIGHT && tx >= 0 && tx < MAP_WIDTH && map.tiles[ty][tx] <= 0) {
			++d1;
			ty += self.dy[tmp];
			tx += self.dx[tmp];
		}
		var tmp2 = (self.direction+3)%4;
		ty = self.y + self.dy[tmp2];
		tx = self.x + self.dx[tmp2];
		while (ty >= 0 && ty < MAP_HEIGHT && tx >= 0 && tx < MAP_WIDTH && map.tiles[ty][tx] <= 0) {
			++d2;
			ty += self.dy[tmp2];
			tx += self.dx[tmp2];
		}	

		if (d1 === d2) self.direction = (Math.random() > 0.5 ? tmp : tmp2);
		else self.direction = (d1 > d2 ? tmp : tmp2);
		
	}
}


Player.prototype.arrayAI[1] = function(self) {
	var dfs = function(x,y) {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT || tmap[y][x]) return 0;
		tmap[y][x] = -1;
		return 1 + dfs(x+1, y) + dfs(x, y-1) + dfs(x-1, y) + dfs(x, y+1);
	}

	var d1 = (self.direction+1)%4;
	var d2 = (self.direction+3)%4;

	var t1, t2, t0;

	var tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);
	t0 = dfs(self.x+self.dx[self.direction], self.y+self.dy[self.direction]);
	
	tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);

	t1 = dfs(self.x+self.dx[d1], self.y+self.dy[d1]);
	
	tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);
	t2 = dfs(self.x+self.dx[d2],self.y+self.dy[d2]);
	console.log('t1: ' + t1 + '  t2: ' + t2);

	if (t1 > t0 && t1 >= t2) self.direction = d1; 
	else if (t2 > t0) self.direction = d2;
}

Player.prototype.update = function() {
	if (!this.dead) {
		if (this.bot) this.AI();
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
		if (map.tiles[this.y][this.x] > 0) {
			this.dead = true;
			this.direction = -1;
		}
		this.lastMove = this.direction;
		map.update(this.x, this.y, this.id, this.dead);
	}
}

Player.prototype.control = function(dt) {
	if (!this.dead && !this.bot) {
		if (kb.char(this.controls.up) && this.lastMove != 3) this.direction = 1;
		if (kb.char(this.controls.left) && this.lastMove != 0) this.direction = 2;
		if (kb.char(this.controls.down) && this.lastMove != 1) this.direction = 3;
		if (kb.char(this.controls.right) && this.lastMove != 2) this.direction = 0;
		if (kb.char(this.controls.stop)) this.direction = -1;
	}
}

//Players
var players = [];
players[0] = new Player({id:1, direction: 0, x: MAP_WIDTH/2, y: MAP_HEIGHT/2});
for (var i = 1; i < NUM_PLAYERS; ++i)
	players[i] = new Player({ id: (i+1), bot:true, difficulty: (i%2), direction: 2*(i%2), x: MAP_WIDTH/2, y: MAP_HEIGHT/2+(2*i)});

if (RANDOM_START) {
	for (var i = 0; i < NUM_PLAYERS; ++i) {
		players[i].x = Math.floor(Math.random()*(MAP_WIDTH-10))+5;
		players[i].y = Math.floor(Math.random()*(MAP_HEIGHT-10))+5;
		players[i].direction = Math.floor(Math.random()*4);
	}
}

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