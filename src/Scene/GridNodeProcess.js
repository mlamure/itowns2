define('Scene/GridNodeProcess',[
	'Scene/BoundingBox',
	'Renderer/Camera',
	'Core/Commander/InterfaceCommander',
	'THREE',
	'Core/defaultValue'
], function(BoundingBox, Camera, InterfaceCommander, THREE, defaultValue) {
	function GridNodeProcess() {
		this.camera = new Camera();
		this.interCommand = new InterfaceCommander();
	}

	GridNodeProcess.prototype.updateCamera = function(camera) {
        this.camera = new Camera(camera.width, camera.height);
        this.camera.camera3D = camera.camera3D.clone();
    };

	GridNodeProcess.prototype.prepare = function(camera) {

		//?????? Nécessaire pour la compilation du programme ??????
	}

    var quaternion = new THREE.Quaternion();

	GridNodeProcess.prototype.frustumCullingOBB = function(node, camera) {

		this.camera = new Camera();
		this.camera.camera3D = camera.camera3D.clone();
		var position = node.OBB().worldToLocal(camera.position().clone());
		this.camera.setPosition(position);
		quaternion.multiplyQuaternions(node.OBB().quadInverse(), camera.camera3D.quaternion);
		this.camera.setRotation(quaternion);

		return this.camera.getFrustum().intersectsBox(node.OBB().box3D);
	}

	GridNodeProcess.prototype.isCulled = function(node, camera) {
		return !(this.frustumCullingOBB(node, camera));
	}

	GridNodeProcess.prototype.checkSSE = function(node, camera) {
		return camera.SSE(node) > 6.0;
	}

	GridNodeProcess.prototype.isVisible = function(node, camera) {
		return !this.isCulled(node, camera) && this.checkSSE(node, camera);
	}

	GridNodeProcess.prototype.createCommands = function(node, params) {
		var status = node.getStatus();
		for(var i = 0; i < status.length; i++)
			this.interCommand.request(status[i], node, params.tree, {});
	}

	GridNodeProcess.prototype.process = function(node, camera, params) {

		this.createCommands(node, params);

		node.setMaterialVisibility(true);

		if(!node.ready()) {
			node.setVisibility(false);
			return;
		} else {
			if(this.isVisible(node, camera)) {
				node.setVisibility(true);
			} else {
				node.setVisibility(false);
			}
		}
	}

	GridNodeProcess.prototype.traverseChildren = function() {

		return false;
	}

	return GridNodeProcess;
});
