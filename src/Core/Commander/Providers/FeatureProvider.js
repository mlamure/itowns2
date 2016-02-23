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
            'Core/defaultValue',
            'Scene/BoundingBox',
            'THREE'
            ],
             function(
                when,
                Projection,
                OslandiaGeometryProvider,
                CoordWMTS,
                Ellipsoid,
                defaultValue,
                BoundingBox,
                THREE
                ){
                   
    function FeatureProvider(options){
       //Constructor
       this.srs = options.srs;
       this.oslandiaGeometryProvider = new OslandiaGeometryProvider({url:"localhost/buildings",
                                               layer:"lyon"});    // TODO: remove hard-coded values
       this.cacheGeometry   = [];
       this.tree            = null;
       
       this.nNode           = 0;
               
    }        

    FeatureProvider.prototype.constructor = FeatureProvider;
    
    FeatureProvider.prototype.executeCommand = function(command)
    {  
        if(command === undefined)
            return when();
        
        var bboxId      = command.paramsFunction.tileId;       
        var parent      = command.requester;
        var options = {boundingBox: undefined}; // tmp
        var tile        = new command.type(options/*TODO: put options here*/);        
        
        var translate   = new THREE.Vector3();
             
        //if(parent.worldToLocal)                
        //    translate = parent.worldToLocal(tile.absoluteCenter.clone());                    
                   
        tile.position.copy(translate);        
        tile.updateMatrixWorld();

        tile.setVisibility(false);
        
        parent.add(tile);


        return this.oslandiaGeometryProvider.getTile(bboxId).then(function(data)
        {
            console.log("coucou");
            //if(cooWMTS.zoom >= 2)                
                //this.setTextureOrtho(image);  
            //else
            //    tile.checkOrtho();
                           
        }.bind(tile)); 
        //return tile;
    };
                          
    return FeatureProvider;                
                 
});
