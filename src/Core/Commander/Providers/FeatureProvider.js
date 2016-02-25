/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global THREE */

define('Core/Commander/Providers/FeatureProvider',[
            'when',
            'Core/Geographic/Projection',
            'Core/Commander/Providers/OslandiaGeometryProvider',
            'Core/Geographic/CoordWMTS',
            'Core/Math/Ellipsoid',
            'Core/defaultValue'
            ],
             function(
                when,
                Projection,
                OslandiaGeometryProvider,
                CoordWMTS,
                Ellipsoid,
                defaultValue
                ){
                   
    function FeatureProvider(options){
       //Constructor
       this.srs = options.srs;
       this.oslandiaGeometryProvider = new OslandiaGeometryProvider({url:"http://localhost/buildings",
                                               layer:"lyon"});    // TODO: remove hard-coded values
       this.cacheGeometry   = [];
    }

    FeatureProvider.prototype.constructor = FeatureProvider;
    
    FeatureProvider.prototype.executeCommand = function(command) {
        if(command === undefined)
            return when();
        
        var bboxId = command.paramsFunction.tileId;
        var bbox = command.paramsFunction.bbox;
        var parent = command.requester;
        var options = {bboxId: bboxId, boundingBox: bbox};
        //var tile        = new command.type(options);
        
        //var translate   = new THREE.Vector3(bbox[0], bbox[1], 0);
             
        //if(parent.worldToLocal)                
        //    translate = parent.worldToLocal(tile.absoluteCenter.clone());                    
                   
        /*tile.position.copy(translate);        
        tile.updateMatrixWorld();

        tile.setVisibility(false);
        
        parent.add(tile);*/


        return this.oslandiaGeometryProvider.getTile(bboxId).then(function(data) {
            options.geometries = data.geometries;
            options.childrenBboxes = data.bboxes;
            var tile = new command.type(options);
            tile.updateMatrixWorld();
            tile.setVisibility(true);
            parent.add(tile);
        }.bind(this));
    };
                          
    return FeatureProvider;                
                 
});
