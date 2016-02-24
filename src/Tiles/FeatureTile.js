/**
* Class: FeatureTile
* Description: Tile containing a set of 3D features
*/


define('Tiles/FeatureTile',[
	'Core/defaultValue',
	'Renderer/NodeMesh',
    'Renderer/BasicMaterial',
    'THREE'], function(defaultValue, NodeMesh, BasicMaterial, THREE){

	function FeatureTile(options){
        //Constructor
        NodeMesh.call( this );
        this.boundingBox = options.boundingBox;
        this.level = defaultValue(options.level, 0);
        this.childrenBboxes = options.childrenBboxes;
        this.loaded = true;
        this.frustumCulled  = false;

        // TOOD : change center
        //this.absoluteCenter = new THREE.Vector3(0.5 * (this.boundingBox[0] + this.boundingBox[2]), 0.5 * (this.boundingBox[1] + this.boundingBox[3]), 0);
        this.absoluteCenter = new THREE.Vector3(this.boundingBox[0], this.boundingBox[1], -160);
        this.material = new BasicMaterial(new THREE.Color(0.8,0,0));
        for(var i = 0; i < options.geometries.length; i++) {
            this.geometry = options.geometries[i];
            break; // TODO : multiple features
        }
        this.geometry.computeBoundingSphere();
        console.log(this.geometry.boundingSphere);
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