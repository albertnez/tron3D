//MAP
function Map() {
	this.tiles = [];
	for (var face = 0; face < 6; ++face) {
		this.tiles[face] = [];		
		for (var y = 0; y < MAP_HEIGHT; ++y) {
			this.tiles[face][y] = [];
			for (var x = 0; x < MAP_WIDTH; ++x) {
				this.tiles[face][y][x] = 0;
			}
		}
	}
}

Map.prototype.next = function(x, y, direction, face) {
	switch (direction) {
		case 0: return face*MAP_WIDTH*MAP_HEIGHT + y*MAP_WIDTH + x + 1;
		case 1: return face*MAP_WIDTH*MAP_HEIGHT + (y-1)*MAP_WIDTH + x;
		case 2: return face*MAP_WIDTH*MAP_HEIGHT + y*MAP_WIDTH + x - 1;
		case 3: return face*MAP_WIDTH*MAP_HEIGHT + (y+1)*MAP_WIDTH + x;
	}
}

Map.prototype.getTile = function(num) {
	var face = Math.floor(num/MAP_WIDTH*MAP_HEIGHT);
	num /= face*MAP_WIDTH*MAP_HEIGHT;
	var y = Math.floor(num/MAP_WIDTH)
	num /= y;
	return {face:face, y:y, x:num};
}

Map.prototype.update = function(face, x, y, id, graphics) {
	this.tiles[face][y][x] = id;
	graphics.update(face,x,y,id);	
}

Map.prototype.remove  = function(face, x, y, id, graphics) {
	if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
	if (this.tiles[face][y][x] == id) {
		graphics.remove(face, x, y);
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