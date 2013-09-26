//MAP
function Map (WIDTH, HEIGHT, tiles) {
	this.WIDTH = WIDTH;
	this.HEIGHT = HEIGHT;
	if (tiles) this.tiles = tiles;
	else this.restart();
}

Map.prototype.update = function (x, y, id, graphics) {
	this.tiles[y][x] = id;
	graphics.update(x,y,id)	
}

Map.prototype.remove  = function (x, y, id, graphics) {
	if (this.tileIsOutOfBounds(x,y)) return;
	if (this.tiles[y][x] == id) {
		graphics.remove(x, y);
		this.tiles[y][x] = 0;
		this.remove(x+1, y, id, graphics);
		this.remove(x, y-1, id, graphics);
		this.remove(x-1, y, id, graphics);
		this.remove(x,y+1, id, graphics);
	}
}

Map.prototype.restart = function () {
	this.tiles = [];
	for (var y = 0; y < this.HEIGHT; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < this.WIDTH; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}

Map.prototype.tileIsOutOfBounds = function (x, y) {
	return (y < 0 || y >= this.HEIGHT || x < 0 || x >= this.WIDTH);
}

Map.prototype.tileIsTaken = function (x, y) {
	return (this.tiles[y][x] > 0);
}

Map.prototype.cloneMap = function () {
	var tilesCopy = [];
	for (var i = 0; i < this.tiles.length; ++i) tilesCopy[i] = this.tiles[i].slice(0);
	return new Map (this.HEIGHT, this.WIDTH, tilesCopy);
}

Map.prototype.dfs = function (x, y, tmap) {
	if (!tmap) tmap = this.cloneMap();
	if (tmap.tileIsOutOfBounds(x,y) || tmap.tiles[y][x] != 0) return 0;
	tmap.tiles[y][x] = -1;
	return 1 + tmap.dfs(x+1, y, tmap) + tmap.dfs(x, y-1, tmap) + tmap.dfs(x-1, y, tmap) + tmap.dfs(x, y+1, tmap);
}