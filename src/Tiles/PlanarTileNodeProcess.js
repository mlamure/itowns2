/**
 * Generated On: 2015-10-5
 * Class: PlanarTileNodeProcess
 * Description: PlanarTileNodeProcess effectue une opération sur un Node.
 */

define('Tiles/PlanarTileNodeProcess', ['Scene/BoundingBox', 'Renderer/Camera', 'Core/Math/MathExtented', 'Core/Commander/InterfaceCommander', 'THREE', 'Core/defaultValue'], function(BoundingBox, Camera, MathExt, InterfaceCommander, THREE, defaultValue) {


    function PlanarTileNodeProcess() {
        //Constructor
        this.camera = new Camera();
        //this.camera.camera3D = camera.camera3D.clone();

        this.interCommand = new InterfaceCommander();    // TODO: InterfaceCommander static class?
    }

    PlanarTileNodeProcess.prototype.updateCamera = function(camera) {
        this.camera = new Camera(camera.width, camera.height);
        this.camera.camera3D = camera.camera3D.clone();
    };

    /**
     * @documentation:
     * @param  {type} node  : the node to try to cull
     * @param  {type} camera: the camera used for culling
     * @return {Boolean}      the culling attempt's result
     */
    PlanarTileNodeProcess.prototype.isCulled = function(node, camera) {
        return !(this.frustumCulling(node, camera));
    };

    PlanarTileNodeProcess.prototype.checkSSE = function(node, camera) {

        return camera.SSE(node) > 6.0;

    };

    PlanarTileNodeProcess.prototype.isVisible = function(node, camera) {
        return !this.isCulled(node, camera) && this.checkSSE(node, camera);
    };

    PlanarTileNodeProcess.prototype.traverseChildren = function(node) {
        return node.visible;
    };

    PlanarTileNodeProcess.prototype.createCommands = function(node, params) {
        var status = node.getStatus();
        for(var i = 0; i < status.length; i++) {
            this.interCommand.request(status[i], node, params.tree, {});
        }
    };

    PlanarTileNodeProcess.prototype.process = function(node, camera, params) {
        var updateType;
        this.createCommands(node, params);

        node.setVisibility(false);
        node.setMaterialVisibility(false);
        if(node.ready()) {
            if(node.noChild()) {
                params.tree.subdivide(node);
            }
            if(!this.isCulled(node, camera) && this.checkSSE(node, camera)) {
                node.setVisibility(true);
                node.setMaterialVisibility(true);
            }
        }
    };

    /**
     * @documentation: Cull node with frustrum and oriented bounding box of node
     * @param {type} node
     * @param {type} camera
     * @returns {PlanarTileNodeProcess_L7.PlanarTileNodeProcess.prototype.frustumCullingOBB.node@pro;camera@call;getFrustum@call;intersectsBox}
     */

    var quaternion = new THREE.Quaternion();

    PlanarTileNodeProcess.prototype.frustumCulling = function(node, camera) {
        this.camera = new Camera();
        this.camera.camera3D = camera.camera3D.clone();
        //this.camera.setPosition(camera.position().clone().sub(node.centerSphere));
        // maybe a more optimised way of doing this?

        var frustum = this.camera.getFrustum();
        return frustum.intersectsObject(node);
    };

    /**
     * @documentation: Pre-computing for the upcoming processes
     * @param  {type} camera
     */
    PlanarTileNodeProcess.prototype.prepare = function(camera) {

    };


    return PlanarTileNodeProcess;

});
