/**
 * Generated On: 2016-05-27
 * Class: FeatureProvider
 * Description: Récupère les data et les transforme en tuile/layer à poser au dessus du terrain.
 */

define('Core/Commander/Providers/FeatureProvider', [
	'Core/Commander/Providers/WFS_Provider',
	'Proj4',
	'Scene/BoundingBox',
	'THREE'
], function(WFS_Provider, Proj4, BoundingBox, THREE) {

	function FeatureProvider(params) {

		this.WFS_Provider = new WFS_Provider({url: 		params.url,
                                              typename: params.typename,
                                              epsgCode: params.epsgCode,
                                              format: 	params.format});
		this.tileParams = params.tileParams;

		var obj 			= this.tileParams.point !== undefined ? this.tileParams.point :
								(this.tileParams.line !== undefined ? this.tileParams.line :
								(this.tileParams.polygon !== undefined ? this.tileParams.polygon : undefined));
		this.radius 		= (obj !== undefined && obj.radius 	  	!== undefined) ? obj.radius 	 : 20;
		this.nbSegment 		= (obj !== undefined && obj.nbSegment   !== undefined) ? obj.nbSegment   : 3;
		this.thetaStart 	= (obj !== undefined && obj.thetaStart  !== undefined) ? obj.thetaStart  : 0;
		this.thetaLength 	= (obj !== undefined && obj.thetaLength !== undefined) ? obj.thetaLength : 2 * Math.PI;
		this.offsetValue 	= (obj !== undefined && obj.length 		!== undefined) ? obj.length 	 : 25;
	}

	FeatureProvider.prototype.constructor = FeatureProvider;

	/**
     * Send the command and process the answer.
     * @param command : Usefull data to make the request
     */
	FeatureProvider.prototype.executeCommand = function (command) {

		var tile = command.requester;
		var bbox = tile.bbox;

		Proj4.defs('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

		var minCoord = Proj4('EPSG:3946').inverse([bbox.minCarto.longitude, bbox.minCarto.latitude]);
		var maxCoord = Proj4('EPSG:3946').inverse([bbox.maxCarto.longitude, bbox.maxCarto.latitude]);

		var projBbox = new BoundingBox(minCoord[0], maxCoord[0], minCoord[1], maxCoord[1]);

		var promise = this.WFS_Provider.getData(projBbox);

		var scope = this;

		promise.then(function(value) {
			var geometry = new THREE.Geometry();
			if(scope.tileParams.line !== undefined)
				scope.processLine(value, geometry, bbox);
			else if (scope.tileParams.point !== undefined)
				scope.processPoint(value, geometry);
			tile.setGeometry(geometry);
		});

		return promise;
	}

	FeatureProvider.prototype.cutLine = function(coords, slope, rest, bbox) {

		if(coords[0] < bbox.minCarto.longitude){
			coords[0] = bbox.minCarto.longitude;
			if(coords[1] >= bbox.minCarto.latitude && coords[1] <= bbox.maxCarto.latitude)
				coords[1] = slope * coords[0] + rest;
		}
		else if (coords[0] > bbox.maxCarto.longitude){
			coords[0] = bbox.maxCarto.longitude;
			if(coords[1] >= bbox.minCarto.latitude && coords[1] <= bbox.maxCarto.latitude)
				coords[1] = slope * coords[0] + rest;
		}
		if(coords[1] < bbox.minCarto.latitude){
			coords[1] = bbox.minCarto.latitude;
			if(coords[0] >= bbox.minCarto.longitude && coords[0] <= bbox.maxCarto.longitude)
				coords[0] = (coords[1] - rest) / slope;
		}
		else if (coords[1] > bbox.maxCarto.latitude){
			coords[1] = bbox.maxCarto.latitude;
			if(coords[0] >= bbox.minCarto.longitude && coords[0] <= bbox.maxCarto.longitude)
				coords[0] = (coords[1] - rest) / slope;
		}
	}

	/**
     * Process the data received from a WFS request with a tile of feature type 'Line'.
     * @param value: the JSON object which contains the data received from the WFS request
     * @param geometry: the geometry used to set the tile geometry
     */
	FeatureProvider.prototype.processLine = function(value, geometry, bbox) {

		var colors = [];

		for (var i = 0; i < value.features.length; i++) {
			var feature 	= value.features[i];
			var coords 		= feature.geometry.coordinates;

			var j = 0;
			var isInsideTile = false;

			//Cut the line according to the tiles limits
			do{
				if(coords[j][0] < bbox.minCarto.longitude || coords[j][0] > bbox.maxCarto.longitude
					|| coords[j][1] < bbox.minCarto.latitude || coords[j][1] > bbox.maxCarto.latitude) {
					if(isInsideTile) {
						var coeffSlope = (coords[j][1] - coords[j - 1][1]) / (coords[j][0] - coords[j - 1][0]);
						var rest = coords[j][1] - coeffSlope * coords[j][0];

						this.cutLine(coords[j], coeffSlope, rest, bbox);

						j++;
					} else if (coords[j+1] != undefined
						&& (coords[j + 1][0] > bbox.minCarto.longitude && coords[j + 1][0] < bbox.maxCarto.longitude
						&& coords[j + 1][1] > bbox.minCarto.latitude && coords[j + 1][1] < bbox.maxCarto.latitude)) {

						var coeffSlope = (coords[j + 1][1] - coords[j][1]) / (coords[j + 1][0] - coords[j][0]);
						var rest = coords[j + 1][1] - coeffSlope * coords[j + 1][0];

						this.cutLine(coords[j], coeffSlope, rest, bbox);

						j = j + 2;
					} else {
						coords.splice(j, 1);
					}
					isInsideTile = false;
				} else {
					isInsideTile = true;
					j++;
				}
			}while (j < coords.length);

			if(coords.length > 1){
				//Compute normal to the first middle line
				var dx 			= coords[1][0] - coords[0][0];
				var dy 			= coords[1][1] - coords[0][1];
				var normal 		= new THREE.Vector3(-dy, dx, 0);
				normal.normalize();

				//Compute offset to find the left and right point with the given offset value
				var offsetX 	= normal.x * this.offsetValue;
				var offsetY 	= normal.y * this.offsetValue;

				//The first point left and point right of the line
				var pointLeft 	= new THREE.Vector3(coords[0][0] - offsetX, coords[0][1] - offsetY, 600 + i * 0.01);
				var pointRight 	= new THREE.Vector3(coords[0][0] + offsetX, coords[0][1] + offsetY, 600 + i * 0.01);

				for (j = 0; j < coords.length - 1; j++) {
					var currentGeometry = new THREE.Geometry();

					//Compute normal to the middle line
					dx = coords[j + 1][0] - coords[j][0];
					dy = coords[j + 1][1] - coords[j][1];
					normal = new THREE.Vector3(-dy, dx, 0);
					normal.normalize();

					//Compute the tangent between 2 following lines to find the next left and right points
					var tangent 		= new THREE.Vector3(new THREE.Vector2((coords[j + 2] - coords[j + 1])).normalize()
															+ new THREE.Vector2((coords[j + 1] - coords[j])).normalize(), 0);
					tangent.normalize();
					var normalTangent 	= new THREE.Vector3(- tangent.y, tangent.x, 0);
					normalTangent.normalize();

					offsetX = normal.x * this.offsetValue;
					offsetY = normal.y * this.offsetValue;

					currentGeometry.vertices.push(pointLeft, pointRight);
					pointLeft  = new THREE.Vector3(coords[j + 1][0] - offsetX, coords[j + 1][1] - offsetY, 600 + i * 0.01);
					pointRight = new THREE.Vector3(coords[j + 1][0] + offsetX, coords[j + 1][1] + offsetY, 600 + i * 0.01);
					currentGeometry.vertices.push(pointLeft, pointRight);

					currentGeometry.faces.push(	new THREE.Face3(0, 2, 1),
												new THREE.Face3(2, 3, 1));

					geometry.computeFaceNormals();
					geometry.computeVertexNormals();

					for (var k = 0; k < currentGeometry.faces.length; k++)
						this.manageMaterial(feature.properties, currentGeometry.faces[k].color);

					geometry.merge(currentGeometry);
				}
			}
		}

		return geometry;
	}

	/**
     * Process the data received from a WFS request with a tile of feature type 'Point'.
     * @param value: the JSON object which contains the data received from the WFS request
     * @param geometry: the geometry used to set the tile geometry
     */
	FeatureProvider.prototype.processPoint = function(value, geometry) {

		for (var i = 0; i < value.features.length; i++) {
			var feature = value.features[i];
			var coords 	= feature.geometry.coordinates;

			var currentGeometry = new THREE.CircleGeometry(this.radius, this.nbSegment, this.thetaStart, this.thetaLength);
			currentGeometry.translate(coords[0], coords[1], 500);

			for (var j = 0; j < currentGeometry.faces.length; j++)
				this.manageMaterial(feature.properties, currentGeometry.faces[j].color);

			geometry.merge(currentGeometry);
		}
		return geometry;
	}

	FeatureProvider.prototype.manageMaterial = function(featureProperties, color) {

		var getType = {};

		if(this.tileParams.point !== undefined){
			if(this.tileParams.point && getType.toString.call(this.tileParams.point) === '[object Function]')
				this.tileParams.point(featureProperties);
			else
				this.manageColor(featureProperties, color, this.tileParams.point);
		} else if (this.tileParams.line !== undefined) {
			if(this.tileParams.line && getType.toString.call(this.tileParams.line) === '[object Function]')
				this.tileParams.line(featureProperties, this.tileParams);
			else
				this.manageColor(featureProperties, color, this.tileParams.line);
		} /*else if (this.tileParams.polygon !== undefined){

		} */else {
			console.log('Le type de data n\'est présentement pas le bon');
		}
	}

	/**
     * Manage to put the colors inside the color manager for a feature type 'Point'.
     * @param properties: properties of the feature
     * @param color : manager of the color of a face
     * @params tileParams: the tile to which apply the geometry
     */
	FeatureProvider.prototype.manageColor = function(properties, color, tileParams) {

		var colorParams = tileParams.color;

		for (var i = 0; i < colorParams.testTab.length; i++) {
			if(properties[colorParams.property] === colorParams.testTab[i]){
				color.setHex(colorParams.colorTab[i]);
				return;
			}
		}
		color.setHex(new THREE.Color(0xFFFFFF));
	}

	return FeatureProvider;
});
