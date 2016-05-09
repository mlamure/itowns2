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
        rootNode.material.visible = false;
        rootNode.parent = null; // TODO: change
        rootNode.level = -1;

        for(var i = 0; i < levelZeroTiles.length; i++) {
            var tile = levelZeroTiles[i];
            this.createTile(tile.id, tile.bbox, rootNode);
        }
    }

    BoundingBoxHierarchy.prototype = Object.create( Layer.prototype );

    BoundingBoxHierarchy.prototype.constructor = BoundingBoxHierarchy;

    BoundingBoxHierarchy.prototype.createTile = function(id,bbox,parent) {
        var params = {bbox: bbox, id: id, level: parent.level + 1};

        var tile = new this.tileType(params);
        parent.add(tile);
    };

   /**
    * @documentation: subdivide node
    * @param {type} node
    */
    BoundingBoxHierarchy.prototype.subdivide = function(node) {
        for(var i = 0; i < node.childrenBboxes.length; i++) {
            var tile = node.childrenBboxes[i];
            this.createTile(tile.id, tile.bbox, node);
        }
    };

    return BoundingBoxHierarchy;

});
