//PLAYER
function Player(obj) {
	for (var prop in obj) this[prop] = obj[prop];
	if (this.bot) this.controls = {};
	this.startX = obj.x;
	this.startY = obj.y;
}

Player.prototype = {
	id: 1,
	bot: false,
	difficulty: 0,
	x: 0,
	y: 0,
	startX: 0,
	startY: 0,
	dead: false,
	direction: 0,
	lastMove: -1,
	controls: {up:'W', left:'A', down:'S', right:'D', stop:' '},
	dx: [1,0,-1,0],
	dy: [0,-1,0,1], 
	arrayAI: [],
}

Player.prototype.AI = function() {
	this.arrayAI[this.difficulty].bind(this)();
}

Player.prototype.move = function() {
	if (!this.dead) {
		if (this.bot) this.AI();
		var tx = this.x+this.dx[this.direction], ty = this.y+this.dy[this.direction];
		//OFF MAP
		if (tx < 0 || tx >= MAP_WIDTH || ty < 0 || ty >= MAP_HEIGHT || map.tiles[ty][tx] > 0) {
			this.dead = true;
			deadPlayers.push({x: this.x, y: this.y, id: this.id});
		}
		else {
			switch(this.direction) {
				case 0: ++this.x; break;
				case 1:	--this.y; break;
				case 2:	--this.x; break;
				case 3:	++this.y; break;
			}
		}

		this.lastMove = this.direction;
		map.update(this.x, this.y, this.id, this.dead);
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
		if (kb.char(this.controls.stop)) this.direction = -1;
	}
}