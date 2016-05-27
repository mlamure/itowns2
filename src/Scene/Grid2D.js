/**
 * Generated On: 2016-05-26
 * Class: Grid2D
 * Description: Grille de tuiles. Toutes les tuiles possèdent un seul et unique parent root.
 */

define('Scene/Grid2D', [
	'Scene/Layer',
	'Core/Geographic/Quad',
	'Renderer/NodeMesh',
	'Scene/BoundingBox',
	'THREE'
], function(Layer, Quad, NodeMesh, BoundingBox, THREE) {

	var scope;

	function Grid2D(type) {
		Layer.call(this, type);

		this.tileType 	= type;

		var rootNode	= new NodeMesh();
		rootNode.link 	= this.link;
		rootNode.material.visible = false;

		rootNode.enablePickingRender = function() { return true; };
		this.add(rootNode);
		rootNode.level	= -1;
		rootNode.parent = null;
		this.rootNode = rootNode;
	}

	Grid2D.prototype = Object.create(Layer.prototype);
	Grid2D.prototype.constructor = Grid2D;

	/**
     * Manage the creation of all tiles under the root node using the size of
     * the box and the size of the tiles.
     * @param bbox : the bounding box to fill with tiles.
     * @param tileSize : vector2 the size along x and y of each tiles.
     */
	Grid2D.prototype.createGridByBoxSize = function(bbox, tileSize) {

		var nX = 0;
		var nY = 0;

		do {
			do {
				var long = bbox.minCarto.longitude;
				var lat  = bbox.minCarto.latitude;
				var currentBbox = new BoundingBox(	long + nX * tileSize.x, long + (nX + 1) * tileSize.x,
													lat  + nY * tileSize.y, lat  + (nY + 1) * tileSize.y 	);
				this.createTile(currentBbox);
				nX++;

			}while(nX * tileSize.x < bbox.dimension.x);

			nY++;
			nX = 0;

		} while(nY * tileSize.y < bbox.dimension.y);
	}

	/**
     * Manage the creation of all tiles under the root node using the initial point
     * of those tiles, their size and numbers along x and y.
     * @param minBoxCoordonates : the coordonates of the initial point where the
     * tiles must be created.
     * @param tileSize : vector2 the size along x and y of each tiles.
     * @param numberTileX : the number of tiles along the x axis.
     * @param numberTileY : the number of tiles along the y axis.
     */
	Grid2D.prototype.createGridByTileNumber = function(minBoxCoordonates, tileSize, numberTileX, numberTileY) {

		for(var nY = 0; nY < numberTileY; nY++) {
			for(var nX = 0; nX < numberTileX; nX++) {
				var long = minBoxCoordonates.longitude;
				var lat  = minBoxCoordonates.latitude;
				var currentBbox = new BoundingBox(	long + nX * tileSize.x, long + (nX + 1) * tileSize.x,
													lat  + nY * tileSize.y, lat  + (nY + 1) * tileSize.y 	);
				this.createTile(currentBbox);
			}
			nX = 0;
		}
	}

	/**
     * Manage the creation of a tile inside the specified bounding box
     * @param bbox : the bounding box where to fix the tile.
     */
	Grid2D.prototype.createTile = function(bbox) {

		var params = {bbox: bbox, level: 1};
		var tile = new this.tileType(params);
		this.rootNode.add(tile);
	}

	return Grid2D;
});
