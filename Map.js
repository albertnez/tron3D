//MAP
function Map(width, height) {
	this.tiles = [];
	for (var y = 0; y < height; ++y) {
		this.tiles[y] = [];
		for (var x = 0; x < width; ++x) {
			this.tiles[y][x] = 0;
		}
	}

	this.width = width;
	this.height = height;

	//Updates map. 
	this.update = function(x, y, id, dead) {
			this.tiles[y][x] = id;
			graphics.update(x,y,id,dead)
	}
}