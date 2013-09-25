// NOOB AI
Player.prototype.arrayAI[0] = function (map) {
	var ty = this.y + this.dy[this.direction], tx = this.x + this.dx[this.direction];
	if (ty < 0 || ty >= MAP_HEIGHT || tx < 0 || tx >= MAP_WIDTH || map.tiles[ty][tx] > 0) {
		var tmp = (this.direction+1)%4;
		ty = this.y + this.dy[tmp];
		tx = this.x + this.dx[tmp];
		var d1 = 0, d2 = 0;
		while (ty >= 0 && ty < MAP_HEIGHT && tx >= 0 && tx < MAP_WIDTH && map.tiles[ty][tx] <= 0) {
			++d1;
			ty += this.dy[tmp];
			tx += this.dx[tmp];
		}
		var tmp2 = (this.direction+3)%4;
		ty = this.y + this.dy[tmp2];
		tx = this.x + this.dx[tmp2];
		while (ty >= 0 && ty < MAP_HEIGHT && tx >= 0 && tx < MAP_WIDTH && map.tiles[ty][tx] <= 0) {
			++d2;
			ty += this.dy[tmp2];
			tx += this.dx[tmp2];
		}	

		if (d1 === d2) this.direction = (Math.random() > 0.5 ? tmp : tmp2);
		else this.direction = (d1 > d2 ? tmp : tmp2);
		
	}
}


Player.prototype.arrayAI[1] = function (map) {
	var dfs = function(x,y) {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT || tmap[y][x]) return 0;
		tmap[y][x] = -1;
		return 1 + dfs(x+1, y) + dfs(x, y-1) + dfs(x-1, y) + dfs(x, y+1);
	}

	var d1 = (this.direction+1)%4;
	var d2 = (this.direction+3)%4;

	var t1, t2, t0;

	var tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);
	t0 = dfs(this.x+this.dx[this.direction], this.y+this.dy[this.direction]);
	
	tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);

	t1 = dfs(this.x+this.dx[d1], this.y+this.dy[d1]);
	
	tmap = [];
	for (var i = 0; i < MAP_HEIGHT; ++i) tmap[i] = map.tiles[i].slice(0);
	t2 = dfs(this.x+this.dx[d2],this.y+this.dy[d2]);

	if (t1 > t0 && t1 >= t2) this.direction = d1; 
	else if (t2 > t0) this.direction = d2;
}