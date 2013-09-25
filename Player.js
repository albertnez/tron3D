//PLAYER

function Player (i, CONF) {
	if (!CONF) throw new Error ('Player needs a CONF.');
	this.id = i+1;
	this.bot = (i >= CONF.NUM_HUMANS);
	this.direction = (CONF.RANDOM_START ? Math.floor(Math.random()*4) : 2*(i%2));
	this.x = this.originX = (CONF.RANDOM_START ? Math.floor(Math.random()*(CONF.MAP_WIDTH-10))+5 : CONF.MAP_WIDTH/2);
	this.y = this.originY = (CONF.RANDOM_START ? Math.floor(Math.random()*(CONF.MAP_HEIGHT-10))+5 : CONF.MAP_HEIGHT/2-(2*CONF.NUM_PLAYERS)+(4*i));
	if (!this.bot) this.controls = this.defaultControls[i];
}

Player.prototype = {
	difficulty: 1,
	dead: false,
	lastMove: -1,
	defaultControls: [{right:'D', up:'W', left:'A', down:'S', stop:' '}, {right:'L', up:'I', left:'J', down:'K', stop:' '}],
	dx: [1,0,-1,0],
	dy: [0,-1,0,1], 
	arrayAI: []
}

Player.prototype.AI = function (map) {
	this.arrayAI[this.difficulty].bind(this)(map);
}

Player.prototype.move = function (map) {
	if (this.dead) return;
	if (this.bot) this.AI(map);
	switch(this.direction) {
		case 0: ++this.x; break;
		case 1:	--this.y; break;
		case 2:	--this.x; break;
		case 3:	++this.y; break;
	}
	this.lastMove = this.direction;
}

Player.prototype.checkPlayerCollision = function (map, players) {
	for (var i = players.length-1; i >= 0; --i) {
		if (i+1 != this.id && this.x == players[i].x && this.y == players[i].y) return true;
	}
}

Player.prototype.isOutOfBounds = function (map) {
	return (this.x < 0 || this.x >= this.CONF.MAP_WIDTH || this.y < 0 || this.y >= this.CONF.MAP_HEIGHT || map.tiles[this.y][this.x] > 0);
}

Player.prototype.checkDeath = function (map, players) {
	if (this.dead) return;
	if (this.isOutOfBounds(map)) this.remove = true;
	else if (this.checkPlayerCollision(map, players)) this.remove = true;
}

Player.prototype.update = function (map, graphics) {
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
	if (this.dead || this.bot) return;
	var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[this.id-1];
	if ((kb.char(this.controls.up) || (gamepad && gamepad.buttons[12])) && this.lastMove != 3) this.direction = 1;
	if ((kb.char(this.controls.left) || (gamepad && gamepad.buttons[14])) && this.lastMove != 0) this.direction = 2;
	if ((kb.char(this.controls.down) || (gamepad && gamepad.buttons[13])) && this.lastMove != 1) this.direction = 3;
	if ((kb.char(this.controls.right) || (gamepad && gamepad.buttons[15])) && this.lastMove != 2) this.direction = 0;
	if (this.controls.stop && kb.char(this.controls.stop)) this.direction = -1;
}