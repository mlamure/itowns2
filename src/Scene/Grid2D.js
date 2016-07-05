/**
 * Generated On: 2016-05-26
 * Class: Grid2D
 * Description: Grille de tuiles. Toutes les tuiles possèdent un seul et unique parent root.
 */

define('Scene/Grid2D', [
	'Scene/Layer',
	'Renderer/NodeMesh',
	'Scene/BoundingBox',
	'THREE'
], function(Layer, NodeMesh, BoundingBox, THREE) {

	function Grid2D(type) {
		Layer.call(this, this.tileType);

		this.tileType = type;

		var rootNode	= new NodeMesh();
		rootNode.link 	= this.link;
		rootNode.material.visible = true;

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

		this.bbox = bbox;
		this.tileSize = tileSize;

		var nX = 0;
		var nY = 0;

		do {
			nX = 0;
			do {
				var long = bbox.minCarto.longitude;
				var lat  = bbox.minCarto.latitude;
				var currentBbox = new BoundingBox(	long + nX * tileSize.x, long + (nX + 1) * tileSize.x,
													lat  + nY * tileSize.y, lat  + (nY + 1) * tileSize.y 	);
				this.createTile(currentBbox);
				nX++;
			}while(nX * tileSize.x < bbox.dimension.x);

			nY++;
		} while(nY * tileSize.y < bbox.dimension.y);

		this.nX = nX;
		this.nY = nY;
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

		this.nX = numberTileX;
		this.nY = numberTileY;
		this.tileSize = tileSize;

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

		this.bbox = new BoundingBox(minBoxCoordonates.longitude, minBoxCoordonates.longitude + (numberTileX -1) * tileSize.x,
									minBoxCoordonates.latitude, minBoxCoordonates.latitude + (numberTileY -1) * tileSize.y);
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

	Grid2D.prototype.intersectPlanePlanePlane = function(plane1, plane2, tilePlane){

		var normalMatrix = new THREE.Matrix3();
		normalMatrix.set(plane1.normal.x, plane1.normal.y, plane1.normal.z,
							plane2.normal.x, plane2.normal.y, plane2.normal.z,
							tilePlane.normal.x, tilePlane.normal.y, tilePlane.normal.z);
		var det = normalMatrix.determinant();

		if(Math.abs(det) > Math.pow(10, -10)){
			var xMat = new THREE.Matrix3();
			var yMat = new THREE.Matrix3();
			var zMat = new THREE.Matrix3();

			//Cramer systeme
			xMat.set(- plane1.constant, - plane2.constant, - tilePlane.constant,
						plane1.normal.y, plane2.normal.y, tilePlane.normal.y,
						plane1.normal.z, plane2.normal.z, tilePlane.normal.z);
			yMat.set(plane1.normal.x, plane2.normal.x, tilePlane.normal.x,
						- plane1.constant, - plane2.constant, - tilePlane.constant,
						plane1.normal.z, plane2.normal.z, tilePlane.normal.z);
			zMat.set(plane1.normal.x, plane2.normal.x, tilePlane.normal.x,
						plane1.normal.y, plane2.normal.y, tilePlane.normal.y,
						- plane1.constant, - plane2.constant, - tilePlane.constant);

			return new THREE.Vector3(xMat.determinant() / det, yMat.determinant() / det, zMat.determinant() / det);
		} else
			return undefined;
	}

	Grid2D.prototype.sortHullTab = function(intersectionPoints) {

		//Sort points inside the intersection tab (we could also sort the tab with the angle by the center of
		//the space but use arctan and cost a lot to compute)
		var sortedPoints = [];
		sortedPoints.push(intersectionPoints[0].clone());
		intersectionPoints.shift();

		//Get the first vector : the closest point to the first point of the array
		var secondIndex = 0;
		var firstVector = intersectionPoints[0].clone().sub(sortedPoints[sortedPoints.length - 1]);
		for (var i = 1; i < intersectionPoints.length; i++) {
			var tmpVector = intersectionPoints[i].clone().sub(sortedPoints[sortedPoints.length - 1]);
			if(tmpVector.length() < firstVector.length()){
				firstVector = tmpVector;
				secondIndex = i;
			}
		}

		sortedPoints.push(intersectionPoints[secondIndex].clone());
		intersectionPoints.splice(secondIndex, 1);

		//Sort the rest of the point using the angle formed by the last vector and the next one. The hull is
		//convexe so there is no need to look for the sign of the angles.
		do{
			var nextIndex = 0;
			var lastVector = sortedPoints[sortedPoints.length - 2].clone().sub(sortedPoints[sortedPoints.length - 1]);
			var angle = Math.acos(lastVector.normalize().dot(intersectionPoints[0].clone().sub(sortedPoints[sortedPoints.length - 1]).normalize()));
			for (var j = 1; j < intersectionPoints.length; j++) {
				var tmpAngle = Math.acos(lastVector.normalize().dot(intersectionPoints[j].clone().sub(sortedPoints[sortedPoints.length - 1])));
				if (tmpAngle > angle){
					angle = tmpAngle;
					nextIndex = j;
				}
			}
			sortedPoints.push(intersectionPoints[nextIndex].clone());
			intersectionPoints.splice(nextIndex, 1);
		}while (intersectionPoints.length !== 0);

		return sortedPoints;
	}

	Grid2D.prototype.bresenhamAlgorithm = function(p1, p2, firstIndex, tilesCoords){

		var x, y, dx, dy;
		var e, e10, e01;

		dx = p2.x - p1.x;
		dy = p2.y - p1.y;

		var currentIndex = firstIndex;

		/*if(dx !== 0){
			if(dx > 0){
				if(dy !== 0){
					if(dy > 0){
						if(dx >= dy){
							//First octant
							e = dx;
							dx = e * 2;
							dy *= 2;
							do{
								tilesCoords.push(currentIndex);
								if((currentIndex / this.tileSize.x) < this.nX)
									currentIndex ++;
								else
									break;
								e -= dy;
								if(e < 0){
									//If the current index must be in the diagonal
									if(currentIndex / this.tileSize.y < this.nY){
										currentIndex += this.nX;
										e += dx;
									}
									else
										break;
								}

							}while(x < p2.x);
						}else {
							//Second octant
						}
					}else {
						if(dx >== -dy){

						}else {

						}
					}
				}else {

				}
			}else {
				if(dy !== 0){
					if(dy > 0){

					}else {

					}
				}else {

				}
			}
		}else {
			if(dy !== 0){
				if(dy > 0){

				}else {

				}
			}
		}*/

		/*y = p1.y;
		e = 0.0;
		e10 = dy / dx;
		e01 = - this.tileSize.x;
		for (x = p1.x; x < p2.x; x = x + this.tileSize.x) {
			e = e + e10;
			console.log(e);
			if(e >= (this.tileSize.x / 2)){
				y = y + this.tileSize.y;
				e = e + e01
			}
		}*/
	}

	Grid2D.prototype.getVisibleTiles = function(camera) {

		var tilesCoords = [];

		var frustum = camera.getFrustum();

		//Compute the parametric equation of the tile plan
		var A = new THREE.Vector3(this.bbox.minCarto.longitude, this.bbox.minCarto.latitude, 0);
		var B = new THREE.Vector3(this.bbox.maxCarto.longitude, this.bbox.minCarto.latitude, 0);
		var C = new THREE.Vector3(this.bbox.minCarto.longitude, this.bbox.maxCarto.latitude, 0);

		var AB = B.sub(A).normalize();
		var AC = C.sub(A).normalize();
		var planeNormal = AB.cross(AC);
		var planeConst = A.x * planeNormal.x + A.y * planeNormal.y + A.z * planeNormal.z;
		var tilePlane = new THREE.Plane(planeNormal, planeConst);

		if(frustum.intersectsObject(this.rootNode)){
			var intersectionPoints = [];
			//Get intersection points inside frustum (taking account the float imprecision)
			for (var i = 0; i < frustum.planes.length - 1; i++) {
				for (var j = i + 1; j < frustum.planes.length; j++) {
					var currentPoint;
					currentPoint = this.intersectPlanePlanePlane(frustum.planes[i], frustum.planes[j], tilePlane);
					if(currentPoint !== undefined){
						var isInFrustum = true;
						for (var k = 0; k < frustum.planes.length; k++) {
							if(frustum.planes[k].distanceToPoint(currentPoint) < -0.5){
								isInFrustum = false;
								break;
							}
						}
						if(isInFrustum)
							intersectionPoints.push(currentPoint);
					}
				}
			}
		}

		var sortedPoints = this.sortHullTab(intersectionPoints);

		//Get first index
		var tmpX = (sortedPoints[0].x - this.bbox.minCarto.longitude) / this.tileSize.x;
		var tmpY = (sortedPoints[0].y - this.bbox.minCarto.latitude) / this.tileSize.y;
		var firstIndex = this.nX * Math.floor(tmpY) + Math.floor(tmpX);

		//Bresenham algorithm to find the tile in the segment
		for (var i = 0; i < sortedPoints.length; i++) {
			var j = i + 1;
			if (j === sortedPoints.length)
				j = 0;
			sortedPoints[i]
			this.bresenhamAlgorithm(sortedPoints[i], sortedPoints[j], firstIndex, tilesCoords);
		}

		//Sort index found by bresenham algorithm

		//Add index to the table to fill the inside of the hull

		return tilesCoords;
	}

	return Grid2D;
});
