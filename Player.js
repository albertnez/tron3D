//PLAYER
function Player(obj) {
	for (var prop in obj) this[prop] = obj[prop];
	if (this.bot) this.controls = {};
	this.originX = obj.x;
	this.originY = obj.y;
	//this.update();
}

Player.prototype = {
	id: 1,
	bot: false,
	difficulty: 0,
	x: 0,
	y: 0,
	originX: 0,
	originY: 0,
	dead: false,
	direction: 0,
	lastMove: -1,
	controls: {up:'W', left:'A', down:'S', right:'D', stop:' '},
	dx: [1,0,-1,0],
	dy: [0,-1,0,1], 
	arrayAI: [],
}

Player.prototype.AI = function(map) {
	this.arrayAI[this.difficulty].bind(this)(map);
}

Player.prototype.move = function(map) {
	if (!this.dead) {
		if (this.bot) this.AI(map);
		switch(this.direction) {
			case 0: ++this.x; break;
			case 1:	--this.y; break;
			case 2:	--this.x; break;
			case 3:	++this.y; break;
		}
		this.lastMove = this.direction;
	}
}

Player.prototype.checkDeath = function(map, players) {
	//OFF MAP
	if (this.dead) return;
	if (this.x < 0 || this.x >= MAP_WIDTH || this.y < 0 || this.y >= MAP_HEIGHT || map.tiles[this.y][this.x] > 0) {
		this.remove = true;
	}
	else {
		//Check collisions!
		for (var i = players.length-1; i >= 0; --i) {
			if (i+1 != this.id) {
				if (this.x === players[i].x && this.y === players[i].y) {
					this.remove = true;
				}
			}
		}
	}
}

Player.prototype.update = function(map, graphics) {
	if (this.dead) return;
	if (this.remove) {
		this.dead = true;
		map.remove(this.originX, this.originY, this.id, graphics);
	}
	else {
		map.update(this.x, this.y, this.id, graphics);
	}
}

Player.prototype.control = function(dt) {
	if (!this.dead && !this.bot) {
		var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[this.id-1];
		//console.log(gamepad);
		if ((kb.char(this.controls.up) || (gamepad && gamepad.buttons[12])) && this.lastMove != 3) this.direction = 1;
		if ((kb.char(this.controls.left) || (gamepad && gamepad.buttons[14])) && this.lastMove != 0) this.direction = 2;
		if ((kb.char(this.controls.down) || (gamepad && gamepad.buttons[13])) && this.lastMove != 1) this.direction = 3;
		if ((kb.char(this.controls.right) || (gamepad && gamepad.buttons[15])) && this.lastMove != 2) this.direction = 0;
		if (this.controls.stop && kb.char(this.controls.stop)) this.direction = -1;
	}
}