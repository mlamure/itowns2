/**
 * Generated On: 2016-05-27
 * Class: TileFeature
 * Description: Tuile correspondant à un layer à poser au dessus des tuiles de terrains.
 */

define('Scene/FeatureMeshTile', [
	'Renderer/NodeMesh',
	'Scene/BoundingBox',
	'Renderer/VaryingColorMaterial',
	'THREE'
], function(NodeMesh, BoundingBox, VaryingColorMaterial, THREE) {

	function FeatureMeshTile(params) {

		NodeMesh.call(this);

		this.material = new VaryingColorMaterial();

		this.bboxId = params.id;
		this.bbox 	= params.bbox;

		this.box3D 	= new THREE.Box3(new THREE.Vector3(params.bbox.minCarto.longitude, params.bbox.minCarto.latitude, params.bbox.minCarto.altitude),
									new THREE.Vector3(params.bbox.maxCarto.longitude, params.bbox.maxCarto.latitude, params.bbox.maxCarto.altitude));
		this.centerSphere = new THREE.Vector3();
		this.level 	= params.level;
		this.geometricError = ((params.bbox[3] - params.bbox[0]) + (params.bbox[4] - params.bbox[1])) / 100;

		this.updateGeometry = true;
		this.cullable = true;
	}

	FeatureMeshTile.prototype = Object.create(NodeMesh.prototype);
	FeatureMeshTile.prototype.constructor = FeatureMeshTile;

	FeatureMeshTile.prototype.setGeometry = function(geometry) {

		this.geometry = geometry;
		this.updateGeometry = false;
	}

	FeatureMeshTile.prototype.getStatus = function() {

		var status = [];
		if(this.updateGeometry)
			status.push("geometry");
		return status;
	}

	FeatureMeshTile.prototype.ready = function() {
		return !this.updateGeometry;
	}

	FeatureMeshTile.prototype.setMatrixRTC = function(rtc) {
		this.material.setMatrixRTC(rtc);
	}

	FeatureMeshTile.prototype.setFog = function(fog) {
		this.material.setFogDistance(fog);
	}

	FeatureMeshTile.prototype.setWireframed = function() {
		this.material.wireframe = true;
		this.material.wireframeLineWidth = 20;
		this.material.linewidth = 20;
	}

	return FeatureMeshTile;
});
