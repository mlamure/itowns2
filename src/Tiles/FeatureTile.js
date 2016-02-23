/**
* Class: FeatureTile
* Description: Tile containing a set of 3D features
*/


define('Tiles/FeatureTile',[
	'Core/defaultValue',
	'Renderer/NodeMesh',
    'THREE'], function(defaultValue, NodeMesh, THREE){

	function FeatureTile(options){
        //Constructor
        NodeMesh.call( this );

        // TODO: exception if mandatory option missing?
        this.boundingBox = options.boundingBox;	
        this.level = defaultValue(options.level, 0);

        //this.absoluteCenter = new THREE.Vector3(bbox.center.x, bbox.center.y, 0);
    }

    FeatureTile.prototype = Object.create( NodeMesh.prototype );

    FeatureTile.prototype.constructor = FeatureTile;

    return FeatureTile;
});