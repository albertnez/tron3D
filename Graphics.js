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
		this.planeGeo.faces[i*2].materialIndex = 
		this.planeGeo.faces[i*2+1].materialIndex = (i+Math.floor(i/MAP_WIDTH)*(MAP_WIDTH+1%2))%2;
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




}

Graphics.prototype.cameraLogic = function(dt, p) {
	if (CAMERA_FOLLOW) {
		var speed = SPS/2; // CHECK THIS
		var dist = CAMERA_DISTANCE;
		this.camera.position.x += (p.x - this.camera.position.x)*dt*speed;
		if (this.camera.position.y > -p.y - dist) speed*=2;
		this.camera.position.y += (-p.y - dist - this.camera.position.y)*dt*speed;
	}

	//CAMERA DEBUG STUFF
	//if (kb.char('Z')) this.camera.position.z += dt*5;
	//if (kb.char('X')) this.camera.position.z -= dt*5;
	//if (kb.char('R')) this.camera.rotation.x += dt;
	//if (kb.char('T')) this.camera.rotation.x -= dt;
}

Graphics.prototype.update = function(x, y, id, dead) {
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

Graphics.prototype.remove = function(x, y) {
	this.scene.remove(this.cubesArray[y][x]);
	this.cubesArray[y][x] = -1;
}