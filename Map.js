//MAP
function Map(WIDTH, HEIGHT) {
	this.tiles = [];
	for (var y = 0; y < HEIGHT; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < WIDTH; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}

Map.prototype.update = function(x, y, id, graphics) {
	this.tiles[y][x] = id;
	graphics.update(x,y,id)	
}

Map.prototype.remove  = function(x, y, id, graphics) {
	if (x < 0 || x >= this.tiles[0].length || y < 0 || y >= this.tiles.length) return;
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
	var HEIGHT = this.tiles.length;
	var WIDTH = this.tiles[0].length;
	this.tiles = [];
	for (var y = 0; y < HEIGHT; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < WIDTH; ++x) {
			this.tiles[y][x] = 0;
		}
	}
}