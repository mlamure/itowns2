/**
* Generated On: 2015-10-5
* Class: BoundingBoxHierarchy
* Description: Hierarchy of bounding boxes, each child box is contained in its parent bounding box.
* Sibling boxes can freely intersect and do not necesseraly completly fill their parent's bounding box.
*/

define('Scene/BoundingBoxHierarchy',[
        'Scene/Layer',
        'Renderer/NodeMesh'
        ], function(Layer, NodeMesh){
    

    function BoundingBoxHierarchy(type, levelZeroTiles) {        
        Layer.call(this,type);
        
        this.tileType = type;

        var rootNode = new NodeMesh();
        rootNode.enablePickingRender = function() { return true;};
        this.add(rootNode);

        for(var tile in levelZeroTiles) {
            this.createTile(tile.id, rootNode);
        }
    }
    
    BoundingBoxHierarchy.prototype = Object.create( Layer.prototype );

    BoundingBoxHierarchy.prototype.constructor = BoundingBoxHierarchy;
    
    BoundingBoxHierarchy.prototype.createTile = function(id,parent) {
        this.interCommand.request({tileId:id},parent,this);
    };    
        
   /**
    * @documentation: subdivide node
    * @param {type} node
    */
    BoundingBoxHierarchy.prototype.subdivide = function(node) {
        for(var id in node.childrenBboxes) {
            this.createTile(id, node);
        }
    };
    
    return BoundingBoxHierarchy;

});
