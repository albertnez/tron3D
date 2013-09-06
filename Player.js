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
	//this.arrayAI[this.difficulty](this);
	this.arrayAI[this.difficulty].bind(this)();

}


Player.prototype.update = function() {
	if (!this.dead) {
		if (this.bot) this.AI();
		var tx = this.x+this.dx[this.direction], ty = this.y+this.dy[this.direction];
		if (tx < 0 || ty >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT || map.tiles[ty][tx] > 0) {
			this.dead = true;
			this.direction = -1;
		}
		else {
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
		}
		this.lastMove = this.direction;
		map.update(this.x, this.y, this.id, this.dead);
		//TESTING REMOVE
		if (this.dead) this.remove();
	}
}

Player.prototype.control = function(dt) {
	if (!this.dead && !this.bot) {

		var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[this.id-1];
		console.log(gamepad);
		if ((kb.char(this.controls.up) || (gamepad && gamepad.buttons[12])) && this.lastMove != 3) this.direction = 1;
		if ((kb.char(this.controls.left) || (gamepad && gamepad.buttons[14])) && this.lastMove != 0) this.direction = 2;
		if ((kb.char(this.controls.down) || (gamepad && gamepad.buttons[13])) && this.lastMove != 1) this.direction = 3;
		if ((kb.char(this.controls.right) || (gamepad && gamepad.buttons[15])) && this.lastMove != 2) this.direction = 0;
		if (kb.char(this.controls.stop)) this.direction = -1;
	}
}

Player.prototype.remove = function() {
	var dfs = function(x, y) {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_WIDTH) return;
		if (map.tiles[y][x] == this.id) {
			graphics.remove(x, y);
			map.tiles[y][x] = 0;
			dfs.bind(this)(x+1, y);
			dfs.bind(this)(x, y-1);
			dfs.bind(this)(x-1, y);
			dfs.bind(this)(x,y+1);
		}
	}
	dfs.bind(this)(this.x, this.y);
}