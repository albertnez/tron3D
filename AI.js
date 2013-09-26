// NOOB AI
Player.prototype.arrayAI[0] = function (map) {
	var ty = this.y + this.dy[this.direction], tx = this.x + this.dx[this.direction];
	if (map.tileIsOutOfBounds(tx, ty) || map.tileIsTaken(tx, ty)) {

		var tmp1 = (this.direction+1)%4,
			t1y = this.y + this.dy[tmp],
			t1x = this.x + this.dx[tmp],
			d1 = 0;

		var tmp2 = (this.direction+3)%4,
			t2y = this.y + this.dy[tmp2],
			t2x = this.x + this.dx[tmp2],
			d2 = 0;

		while (d1 == d2) {
			if (!map.tileIsOutOfBounds(t1x, t1y) && !map.tileIsTaken(t1x, t1y)) {
				++d1;
				t1y += this.dy[tmp1];
				t1x += this.dx[tmp1];
			}
			if (!map.tileIsOutOfBounds(t2x, t2y) && !map.tileIsTaken(t2x, t2y)) {
				++d2;
				t2y += this.dy[tmp2];
				t2x += this.dx[tmp2];
			}
		}

		if (d1 === d2) this.direction = (Math.random() > 0.5 ? tmp1 : tmp2);
		else this.direction = (d1 > d2 ? tmp1 : tmp2);
		
	}
}

Player.prototype.arrayAI[1] = function (map) {
	var	d1 = (this.direction+1)%4,
		d2 = (this.direction+3)%4,
		t0 = map.dfs(this.x+this.dx[this.direction], this.y+this.dy[this.direction]),
		t1 = map.dfs(this.x+this.dx[d1], this.y+this.dy[d1]),
		t2 = map.dfs(this.x+this.dx[d2],this.y+this.dy[d2]);

	if (t1 > t0 && t1 >= t2) this.direction = d1; 
	else if (t2 > t0) this.direction = d2;
}