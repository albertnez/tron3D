//GRAPHICS

//http://stackoverflow.com/questions/641857/javascript-window-resize-event
var addEvent = function(elem, type, eventHandle) {
    if (elem == null || elem == undefined) return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

function Graphics (CONF) {
	this.CONF = CONF;
	//SCENE
	this.scene = new THREE.Scene();
	//CAMERA
	this.FOV = 45;
	this.camera = new THREE.PerspectiveCamera( this.FOV, window.innerWidth / window.innerHeight, 0.1, 1000 );
	//RENDERER
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( this.renderer.domElement );

	addEvent(window, 'resize', function () {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}.bind(this));

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

	//BOARD
	this.materialsArray = [];
	this.materialsArray.push(new THREE.MeshBasicMaterial({color: 0x000000}));
	this.materialsArray.push(new THREE.MeshBasicMaterial({color: 0xFFFFFF}));

	this.multiMaterial = new THREE.MeshFaceMaterial(this.materialsArray);
	this.planeGeo = new THREE.PlaneGeometry( CONF.MAP_WIDTH, CONF.MAP_HEIGHT, CONF.MAP_WIDTH, CONF.MAP_HEIGHT );
	for (var i = 0; 2*i < CONF.MAP_WIDTH*CONF.MAP_HEIGHT*2; ++i) {
		this.planeGeo.faces[i*2].materialIndex = 
		this.planeGeo.faces[i*2+1].materialIndex = (i+Math.floor(i/CONF.MAP_WIDTH)*(CONF.MAP_WIDTH+1%2))%2; //Sure one of them isn't MAP_HEIGHT?
	}
	
	this.generateScene();

}

Graphics.prototype.generateScene = function () {
	this.plane = new THREE.Mesh( 
		this.planeGeo,
		this.multiMaterial
	);
	//make the top left tile be at (0,0);
	this.plane.position.x = this.CONF.MAP_WIDTH*0.5-0.5; 
	this.plane.position.y = -this.CONF.MAP_HEIGHT*0.5+0.5;
	this.scene.add(this.plane);

	//CAMERA SETTINGS
	if (this.CONF.CAMERA_FOLLOW) {
		this.camera.rotation.x = 0.38;
		this.camera.position.x = this.CONF.MAP_WIDTH/2;
		this.camera.position.y = -this.CONF.MAP_HEIGHT;
		this.camera.position.z = this.CONF.CAMERA_DISTANCE;
	}
	else {
		this.camera.position.x = this.CONF.MAP_WIDTH/2;
		this.camera.position.y = -this.CONF.MAP_HEIGHT/2;
		this.camera.position.z = Math.max(this.CONF.MAP_HEIGHT, this.CONF.MAP_WIDTH)*1.1+10;
	}

	//CUBES ARRAY
	this.cubesArray = [];
	for (var i = 0; i < this.CONF.MAP_HEIGHT; ++i) {
		this.cubesArray[i] = [];
		for (var j = 0; j < this.CONF.MAP_WIDTH; ++j) {
			this.cubesArray[i][j] = -1;
		}
	}
}

Graphics.prototype.cameraLogic = function(dt, p) {
	if (this.CONF.CAMERA_FOLLOW) {
		var speed = this.CONF.SPS/8;
		var dist = this.CONF.CAMERA_DISTANCE/2;
		this.camera.position.x += (p.x - this.camera.position.x)*dt*speed;
		if (this.camera.position.y > -p.y - dist) speed*=2;
		this.camera.position.y += (-p.y - dist - this.camera.position.y)*dt*speed;
	}
}

Graphics.prototype.update = function(x, y, id) {
	if (this.cubesArray[y][x] === -1) {
		var cube = THREE.SceneUtils.createMultiMaterialObject(
			new THREE.CubeGeometry(1, 1, 0.5), 
			[
				new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true}),
				new THREE.MeshBasicMaterial({color: this.colors[id]}) 
			] 
		);

		cube.position.x = x;
		cube.position.y = -y;
		cube.position.z = 0.25;

		this.cubesArray[y][x] = cube;
		this.scene.add(this.cubesArray[y][x]);
	}
	else {
		this.cubesArray[y][x].children[1].material.color.setHex(this.colors[id]);
	}
}

Graphics.prototype.remove = function(x, y) {
	this.scene.remove(this.cubesArray[y][x]);
	this.cubesArray[y][x] = -1;
}

Graphics.prototype.restart = function() {
	// REMOVE CURRENT OBJECTS FROM SCENE
	for (var i = this.scene.children.length-1; i >= 0; i--) {
 		this.scene.remove(this.scene.children[i]);
	}

	this.generateScene();
}

Graphics.prototype.render = function () {
	this.renderer.render(this.scene, this.camera);
}