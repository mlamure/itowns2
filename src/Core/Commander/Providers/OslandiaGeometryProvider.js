// TODO: fix comments

/**
* Class: OslandiaGeometryProvider
* Description: Provides data from a WMS stream
*/


define('Core/Commander/Providers/OslandiaGeometryProvider',[
            'Core/Commander/Providers/Provider',
            'Core/Commander/Providers/IoDriver_JSON',
            'Core/Commander/Providers/GeoJSONToThree',
            'when',
            'Core/defaultValue',
            'THREE',
            'Core/Commander/Providers/CacheRessource'],
        function(
                Provider,
                IoDriverJSON,
                GeoJSONToThree,
                when,
                defaultValue,
                THREE,
                CacheRessource){

    /**
     * Return url wms MNT
     * @param {String} options.url: service base url
     * @param {String} options.layer: requested data layer
     * @param {String} options.srs: spatial reference system to use
     * @param {String} options.format: image format (default: format/jpeg)
     * @param {String} options.width: image width (default: 256)
     * @param {String} options.height: image height (default: 256)
     * @returns {Object@call;create.url.url|String}
     */
    function OslandiaGeometryProvider(options) {
        //Constructor

        Provider.call( this,new IoDriverJSON());
        this.cache         = CacheRessource();

        this.baseUrl = defaultValue(options.url,"");
        this.layer = defaultValue(options.layer,"");
        this.format = defaultValue(options.format,"GeoJSON");
        this.srs = defaultValue(options.srs,"");
        this.width = defaultValue(options.width, 256);
        this.height = defaultValue(options.height, 256);
    }

    OslandiaGeometryProvider.prototype = Object.create( Provider.prototype );

    OslandiaGeometryProvider.prototype.constructor = OslandiaGeometryProvider;


    /**
     * Returns the url for a WMS query with the specified bounding box
     * @param {BoundingBox} bbox: requested bounding box
     * @returns {Object@call;create.url.url|String}
     */
    OslandiaGeometryProvider.prototype.url = function(tileId) {
        var url = this.baseUrl + "?query=getGeometry&city="+ this.layer + "&format=" + this.format +
            "&tile=" + tileId /*+ "&ATTRIBUTES="*/;
        return url;
    };


    /**
     * Returns a texture from the WMS stream with the specified bounding box
     * @param {BoundingBox} bbox: requested bounding box
     * @returns {WMS_Provider_L15.WMS_Provider.prototype@pro;_IoDriver@call;read@call;then}
     */
    OslandiaGeometryProvider.prototype.getTile = function(tileId) {

        if(tileId === undefined) {
            return when(-2);
        }

        var url = this.url(tileId);
        var cachedTile = this.cache.getRessource(url);

        if(cachedTile !== undefined){
            return when(cachedTile);
        }
        return this._IoDriver.read(url).then(function(geoJSON) {
            var result = {};
            result.bboxes = geoJSON.tiles;

            result.geometries = [];
            var geoms = GeoJSONToThree.convert(geoJSON.geometries);
            result.geometries = geoms.geometries;

            this.cache.addRessource(url,result);
            return result;
        }.bind(this));
    };

    return OslandiaGeometryProvider;

});
