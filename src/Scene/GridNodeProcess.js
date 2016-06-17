/**
 * Generated On: 2016-05-26
 * Class: GridNodeProcess
 * Description: Effectue une opération sur un node de type grid.
 */

define('Scene/GridNodeProcess',[
	'Scene/BoundingBox',
	'Renderer/Camera',
	'Core/Commander/InterfaceCommander'
], function(BoundingBox, Camera, InterfaceCommander) {

	function GridNodeProcess() {

		this.camera = new Camera();
		this.interCommand = new InterfaceCommander();
	}

	GridNodeProcess.prototype.updateCamera = function(camera) {

        this.camera = new Camera(camera.width, camera.height);
        this.camera.camera3D = camera.camera3D.clone();
    };

	GridNodeProcess.prototype.prepare = function() {

		//?????? Nécessaire pour la compilation du programme ??????
	}

	GridNodeProcess.prototype.frustumCulling = function(node, camera) {

        return camera.getFrustum().intersectsBox(node.box3D);
    };

	GridNodeProcess.prototype.isCulled = function(node, camera) {

		return !(this.frustumCulling(node, camera));
	}

	GridNodeProcess.prototype.checkSSE = function(node, camera) {

		return camera.SSE(node) > 6.0;
	}

	GridNodeProcess.prototype.isVisible = function(node, camera) {

		return !this.isCulled(node, camera)/* && this.checkSSE(node, camera)*/;
	}

	GridNodeProcess.prototype.createCommands = function(node, params) {

		var status = node.getStatus();
		for(var i = 0; i < status.length; i++)
			this.interCommand.request(status[i], node, params.tree, {});
	}

	/**
     * Process the visibility value of the node.
     * @param node : the node (tiles) to check.
     * @param camera : the camera of the world.
     * @param params : the params used to create the command request
     */
	GridNodeProcess.prototype.process = function(node, camera, params) {

		node.setVisibility(false);
		node.setMaterialVisibility(false);

		if(this.isVisible(node, camera)) {
			this.createCommands(node, params);
			if(node.ready()) {
				node.setMaterialVisibility(true);
				node.setVisibility(true);
			}
		}
	}

	/**
     * Check if the node has a children. Always false in the case of the grid.
     */
	GridNodeProcess.prototype.traverseChildren = function() {

		return false;
	}

	return GridNodeProcess;
});
