/**
 * Generated On: 2015-10-5
 * Class: ApiPlane
 * Description: Classe façade pour attaquer les fonctionnalités du code.
 */


define('Core/Commander/Interfaces/ApiInterface/ApiPlane', [
       'Core/Commander/Interfaces/EventsManager',
       'Scene/Scene',
       'Plane/PlanarNodeProcess',
       'Tiles/PlanarTileNodeProcess',
       'Globe/Globe',
       'Core/Commander/Providers/WMTS_Provider',
       'Core/Geographic/CoordCarto',
       'Core/Geographic/Projection',
       'Core/Commander/Providers/TileProvider',
       //TEMP
       'Core/Commander/Providers/FeatureProvider',
       'Tiles/FeatureTile',
       'Scene/BoundingBoxHierarchy',
       'Scene/BoundingBox',
       'Plane/Plane'], function(
           EventsManager,
           Scene,
           PlanarNodeProcess,
           PlanarTileNodeProcess,
           Globe,
           WMTS_Provider,
           CoordCarto,
           Projection,
           TileProvider,
           FeatureProvider,
           FeatureTile,
           BoundingBoxHierarchy,
           BoundingBox,
           Plane) {

    function ApiPlane() {
        //Constructor

        this.scene = null;
        this.commandsTree = null;
        this.projection = new Projection();

    }


    ApiPlane.prototype.constructor = ApiPlane;


    /**
     * @param Command
     */
    ApiPlane.prototype.add = function(/*Command*/) {
        //TODO: Implement Me

    };


    /**
     * @param commandTemplate
     */
    ApiPlane.prototype.createCommand = function(/*commandTemplate*/) {
        //TODO: Implement Me

    };

    /**
     */
    ApiPlane.prototype.execute = function() {
        //TODO: Implement Me

    };

    ApiPlane.prototype.addImageryLayer = function(layer) {

        var map = this.scene.getMap();
        var manager = this.scene.managerCommand;
        var providerWMTS = manager.getProvider(map.tiles).providerWMTS;

        providerWMTS.addLayer(layer);
        map.colorTerrain.services.push(layer.id);

    };

    ApiPlane.prototype.addElevationLayer = function(layer) {

        var map = this.scene.getMap();
        var manager = this.scene.managerCommand;
        var providerWMTS = manager.getProvider(map.tiles).providerWMTS;

        providerWMTS.addLayer(layer);
        map.elevationTerrain.services.push(layer.id);

    };

    ApiPlane.prototype.createScene = function(coordCarto) {
        // TODO: Normalement la creation de scene ne doit pas etre ici....
        // Deplacer plus tard

        var gLDebug = false; // true to support GLInspector addon
        var debugMode = false;

        //gLDebug = true; // true to support GLInspector addon
        //debugMode = true;

        this.scene = Scene(coordCarto,debugMode,gLDebug);

        //var map = new Globe(this.scene.size,gLDebug);
        var map = new Plane({bbox: new BoundingBox(1837816.94334, 1847692.32501, 5170036.4587, 5178412.82698)});
        var np = new PlanarNodeProcess();
        var tnp = new PlanarTileNodeProcess();

        this.scene.add(map, np);
        this.scene.managerCommand.addLayer(map.tiles, new TileProvider({ellipsoid: map.ellipsoid, gLDebug: gLDebug}));


        //var lvl0bbox = [{id:"0/2/2", bbox:[1841670.22052,5173987.91682,1843851.84595,5176096.53674]}];
        var lvl0bbox = [{id:"0/1/4",bbox:[1845740.82505,5171978.17265,1847591.88989,5174128.65401]},{id:"0/1/0",bbox:[1837860.98027,5173155.88142,1839705.26255,5174262.62047]},{id:"0/1/1",bbox:[1839696.36526,5171941.91967,1841897.85247,5174285.91092]},{id:"0/1/2",bbox:[1841708.09015,5171921.3019,1843874.66359,5174094.16246]},{id:"0/1/3",bbox:[1843737.06688,5171802.20032,1845902.48552,5174128.62589]},{id:"0/0/4",bbox:[1845762.45189,5170806.14803,1846940.04207,5172229.45668]},{id:"0/0/1",bbox:[1841438.76568,5171682.70222,1841565.80615,5172014.45009]},{id:"0/0/3",bbox:[1843724.93684,5170411.04828,1846053.80175,5172267.49646]},{id:"0/0/2",bbox:[1841785.73131,5170303.26842,1843864.94833,5172174.32728]},{id:"0/2/3",bbox:[1843749.53408,5173911.40267,1846022.29786,5176061.92588]},{id:"0/2/2",bbox:[1841663.99809,5173984.25176,1843851.84595,5176096.53674]},{id:"0/2/1",bbox:[1839574.05873,5173716.06149,1842054.89113,5176191.39531]},{id:"0/2/0",bbox:[1838645.50709,5174015.88478,1839892.64343,5176059.28511]},{id:"0/2/4",bbox:[1845704.28672,5173955.27624,1847648.66845,5174872.51449]},{id:"0/3/2",bbox:[1841798.00299,5175994.25753,1843854.97253,5177629.24456]},{id:"0/3/3",bbox:[1843466.68378,5175959.17764,1844882.56823,5177744.54112]},{id:"0/3/0",bbox:[1838995.61181,5175899.99259,1839984.14871,5178124.04472]},{id:"0/3/1",bbox:[1839638.41022,5175752.29651,1841983.39523,5178145.57074]},{id:"0/4/1",bbox:[1839703.8782,5177977.15874,1841855.05949,5179908.35233]},{id:"0/4/0",bbox:[1838794.22426,5177870.60234,1839690.98937,5178253.54778]},{id:"0/4/2",bbox:[1841738.64875,5178887.63625,1842877.55355,5180280.04012]}];

        var buildings = new BoundingBoxHierarchy(FeatureTile, lvl0bbox);
        this.scene.add(buildings, tnp);
        this.scene.managerCommand.addLayer(buildings, new FeatureProvider({srs:"EPSG:3946"}));

        //!\\ TEMP
        this.scene.wait(0);
        //!\\ TEMP

        return this.scene;

    };

    ApiPlane.prototype.setLayerAtLevel = function(baseurl,layer/*,level*/) {
 // TODO CLEAN AND GENERIC
        var wmtsProvider = new WMTS_Provider({url:baseurl, layer:layer});
        this.scene.managerCommand.providerMap[4] = wmtsProvider;
        this.scene.managerCommand.providerMap[5] = wmtsProvider;
        this.scene.managerCommand.providerMap[this.scene.layers[0].node.meshTerrain.id].providerWMTS = wmtsProvider;
        this.scene.browserScene.updateNodeMaterial(wmtsProvider);
        this.scene.renderScene3D();
    };

    ApiPlane.prototype.showClouds = function(value) {

        this.scene.layers[0].node.showClouds(value);
    };

    ApiPlane.prototype.setRealisticLightingOn = function(value) {

        this.scene.gfxEngine.setLightingOn(value);
        this.scene.layers[0].node.setRealisticLightingOn(value);
        this.scene.browserScene.updateMaterialUniform("lightingOn",value ? 1:0);
    };

    ApiPlane.prototype.setStreetLevelImageryOn = function(value){

        this.scene.setStreetLevelImageryOn(value);
    }

     /**
    * Gets orientation angles of the current camera, in degrees.
    * @constructor
    */
    ApiPlane.prototype.getCameraOrientation = function () {

        var tiltCam = this.scene.currentControls().getTiltCamera();
        var headingCam = this.scene.currentControls().getHeadingCamera();
        return [tiltCam, headingCam];
    };

    /**
    * Get the camera location projected on the ground in lat,lon.
    * @constructor
    */

    ApiPlane.prototype.getCameraLocation = function () {

        var cam = this.scene.currentCamera().camera3D;
        return this.projection.cartesianToGeo(cam.position);
    };

    /**
    * Gets the coordinates of the current central point on screen.
    * @constructor
    * @return {Position} postion
    */

    ApiPlane.prototype.getCenter = function () {

        var controlCam = this.scene.currentControls();
        return this.projection.cartesianToGeo(controlCam.globeTarget.position);
    };

    /**
    * Gets orientation angles of the current camera, in degrees.
    * @constructor
    * @param {Orientation} Param - The angle of the rotation in degrees.
    */

    ApiPlane.prototype.setCameraOrientation = function (orientation /*param,pDisableAnimationopt*/) {

        this.setHeading(orientation.heading);
        this.setTilt(orientation.tilt);
    };

    /**
    * Pick a position on the globe at the given position.
    * @constructor
    * @param {Number | MouseEvent} x|event - The x-position inside the Globe element or a mouse event.
    * @param {number | undefined} y - The y-position inside the Globe element.
    * @return {Position} postion
    */
    ApiPlane.prototype.pickPosition = function (mouse,y) {

        if(mouse)
            if(mouse.clientX)
            {
                mouse.x = mouse.clientX;
                mouse.y = mouse.clientY;
            }
            else
            {
                mouse.x = mouse;
                mouse.y = y;
            }

        var pickedPosition = this.scene.getPickPosition(mouse);

        this.scene.renderScene3D();

        return this.projection.cartesianToGeo(pickedPosition);
    };

    /**
    * Get the tilt.
    * @constructor
    * @return {Angle} number - The angle of the rotation in degrees.
    */

    ApiPlane.prototype.getTilt = function (){

        var tiltCam = this.scene.currentControls().getTilt();
        return tiltCam;
    };

    /**
    * Get the rotation.
    * @constructor
    * @return {Angle} number - The angle of the rotation in degrees.
    */

    ApiPlane.prototype.getHeading = function (){

        var headingCam = this.scene.currentControls().getHeading();
        return headingCam;
    };

    /**
    * Get the "range", i.e. distance in meters of the camera from the center.
    * @constructor
    * @return {Number} number
    */

    ApiPlane.prototype.getRange = function (){

        var controlCam = this.scene.currentControls();
        var ellipsoid = this.scene.getEllipsoid();
        var ray = controlCam.getRay();

        var intersection = ellipsoid.intersection(ray);

        // var center = controlCam.globeTarget.position;
        var camPosition = this.scene.currentCamera().position();
        // var range = center.distanceTo(camPosition);
        var range = intersection.distanceTo(camPosition);

        return range;
    };

    /**
    * Change the tilt.
    * @constructor
    * @param {Angle} Number - The angle.
    * @param {Boolean} [pDisableAnimation] - Used to force the non use of animation if its enable.
    */

    ApiPlane.prototype.setTilt = function (tilt/*, bool*/) {

        this.scene.currentControls().setTilt(tilt);
    };

    /**
    * Change the tilt.
    * @constructor
    * @param {Angle} Number - The angle.
    * @param {Boolean} [pDisableAnimation] - Used to force the non use of animation if its enable.
    */

    ApiPlane.prototype.setHeading = function (heading/*, bool*/){

        this.scene.currentControls().setHeading(heading);
    };

    /**
    * Resets camera tilt.
    * @constructor
    * @param {Boolean} [pDisableAnimation] - Used to force the non use of animation if its enable.
    */

    ApiPlane.prototype.resetTilt = function (/*bool*/) {

        this.scene.currentControls().setTilt(0);
    };

    /**
    * Resets camera heading.
    * @constructor
    * @param {Boolean} [pDisableAnimation] - Used to force the non use of animation if its enable.
    */

    ApiPlane.prototype.resetHeading = function (/*bool*/) {

        this.scene.currentControls().setHeading(0);
    };

    /**
    * Return the distance in meter between two geographic position.
    * @constructor
    * @param {Position} First - Position.
    * @param {Position} Second - Position.
    */

    ApiPlane.prototype.computeDistance = function(p1,p2){

        this.scene.getEllipsoid().computeDistance(p1,p2);
    };

    /**
    * Moves the central point on screen to specific coordinates.
    * @constructor
    * @param {Position} position - The position on the map.
    */

    ApiPlane.prototype.setCenter = function (position) {

        var position3D = this.scene.getEllipsoid().cartographicToCartesian(position);
        this.scene.currentControls().setCenter(position3D);
    };

    /**
    * Set the "range", i.e. distance in meters of the camera from the center.
    * @constructor
    * @param {Number} pRange - The camera altitude.
    * @param {Boolean} [pDisableAnimation] - Used to force the non use of animation if its enable.
    */

    ApiPlane.prototype.setRange = function (pRange/*, bool*/){

        this.scene.currentControls().setRange(pRange);
    };

    ApiPlane.prototype.launchCommandApi = function () {
//        console.log(this.getCenter());
//        console.log(this.getCameraLocation());
//        console.log(this.getCameraOrientation());
//        console.log(this.pickPosition());
//        console.log(this.getTilt());
//        console.log(this.getHeading());
       // console.log(this.getRange());
//        this.setTilt(45);
//        this.setHeading(180);
//        this.resetTilt();
//        this.resetHeading();
//        this.computeDistance(p1, p2);
//
//        var p = new CoordCarto(2.438544,49.8501392,0);
//        this.setCenter(p);
//
//        this.testTilt();
//        this.testHeading();
        //console.log("range 1  " + this.getRange());
        //this.setRange(1000);
//        console.log(this.getRange());
//        this.setCameraOrientation({heading:45,tilt:30});
    };

//    ApiPlane.prototype.testTilt = function (){
//        this.setTilt(90);
//        console.log(this.getTilt());
//        this.resetTilt();
//        console.log(this.getTilt());
//    };
//
//    ApiPlane.prototype.testHeading = function (){
//        this.setHeading(90);
//        console.log(this.getHeading());
//        this.resetHeading();
//        console.log(this.getHeading());
//    };

    ApiPlane.prototype.showKML = function(value) {

        this.scene.layers[0].node.showKML(value);
        this.scene.renderScene3D();
    };


    return ApiPlane;

});
