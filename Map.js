//MAP
function Map() {
	this.tiles = [];
	for (var y = 0; y < MAP_HEIGHT; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < MAP_WIDTH; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}

Map.prototype.update = function(x, y, id, graphics) {
	this.tiles[y][x] = id;
	graphics.update(x,y,id)	
}

Map.prototype.remove  = function(x, y, id, graphics) {
	if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
	if (this.tiles[y][x] == id) {
		graphics.remove(x, y);
		this.tiles[y][x] = 0;
		this.remove(x+1, y, id, graphics);
		this.remove(x, y-1, id, graphics);
		this.remove(x-1, y, id, graphics);
		this.remove(x,y+1, id, graphics);
	}
}

Map.prototype.restart = function() {
	this.tiles = [];
	for (var y = 0; y < MAP_HEIGHT; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < MAP_WIDTH; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}