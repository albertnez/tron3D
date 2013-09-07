//MAP
function Map(width, height) {
	this.tiles = [];
	for (var y = 0; y < height; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < width; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}

Map.prototype.update = function(x, y, id, dead) {
	this.tiles[y][x] = id;
	graphics.update(x,y,id,dead)	
}

Map.prototype.remove  = function(x, y, id) {
	if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
	if (this.tiles[y][x] == id) {
		graphics.remove(x, y);
		this.tiles[y][x] = 0;
		this.remove(x+1, y, id);
		this.remove(x, y-1, id);
		this.remove(x-1, y, id);
		this.remove(x,y+1, id);
	}
}