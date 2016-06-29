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
       this.oslandiaGeometryProvider = new OslandiaGeometryProvider(options);
       this.cacheGeometry   = [];
    }

    FeatureProvider.prototype.constructor = FeatureProvider;

    FeatureProvider.prototype.executeCommand = function(command) {
        var tile = command.requester;

        var bboxId = tile.bboxId;
        var bbox = tile.bbox;
        var parent = command.requester;

        return this.oslandiaGeometryProvider.getTile(bboxId).then(function(data) {
            tile.setGeometry(data.geometries);
            tile.setChildrenBoundingBoxes(data.bboxes);
            //tile.updateMatrixWorld();
            //tile.setVisibility(true);
            //parent.add(tile);
        }.bind(this));
    };

    return FeatureProvider;

});
