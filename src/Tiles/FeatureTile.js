/**
* Class: FeatureTile
* Description: Tile containing a set of 3D features
*/


define('Tiles/FeatureTile',[
	'Core/defaultValue',
    'Scene/BoundingBox',
	'Renderer/NodeMesh',
    'Renderer/BasicMaterial',
    'THREE'], function(defaultValue, BoundingBox, NodeMesh, BasicMaterial, THREE){

	function FeatureTile(options){
        //Constructor
        NodeMesh.call( this );
        this.bboxId = options.bboxId;
        this.bbox = new BoundingBox(options.boundingBox[0], options.boundingBox[2],
            options.boundingBox[1], options.boundingBox[3]);
        this.childrenBboxes = options.childrenBboxes;
        this.loaded = true;
        this.frustumCulled  = false;
        this.divided = false;

        this.absoluteCenter = new THREE.Vector3(options.boundingBox[0], options.boundingBox[1], 0);
        this.material = new BasicMaterial(new THREE.Color(0.8,0.8,0.8));
        this.geometry = options.geometries;
        this.geometry.computeBoundingSphere();
        this.centerSphere = new THREE.Vector3().addVectors(this.geometry.boundingSphere.center, this.absoluteCenter);
    }

    FeatureTile.prototype = Object.create( NodeMesh.prototype );

    FeatureTile.prototype.constructor = FeatureTile;

    FeatureTile.prototype.enableRTC = function(enable)
    {
        this.material.enableRTC(enable);
    };
    
    FeatureTile.prototype.enablePickingRender = function(enable)
    {           
        this.material.enablePickingRender(enable);
    };
    
    FeatureTile.prototype.setFog = function(fog)
    {                 
        this.material.setFogDistance(fog);
    };
    
    FeatureTile.prototype.setMatrixRTC = function(rtc)
    {                 
        this.material.setMatrixRTC(rtc);
    };
    
    FeatureTile.prototype.setDebug = function(enable)
    {                 
        this.material.setDebug(enable);
    };
    
    FeatureTile.prototype.setSelected = function(select)
    {                 
        this.material.setSelected(select);        
    };

    return FeatureTile;
});