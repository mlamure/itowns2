/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define('Core/Commander/Providers/gLTFProvider',[
        'Core/Commander/Providers/Provider',
        'Core/Commander/Providers/IoDrivergLTF', 
        'Core/Geographic/CoordCarto', 
        'Core/Math/Ellipsoid',
        'THREE'], 
        function(Provider,
                IoDrivergLTF, 
                CoordCarto, 
                Ellipsoid,
                THREE){
            
        function gLTFProvider()
        {
            //constructor
            this.ioDriver   = new IoDrivergLTF();
        };  
        
          
        gLTFProvider.prototype.constructor = gLTFProvider;
        
        
        gLTFProvider.prototype.get = function(url)
        {
            return this.ioDriver.loadGLTF(url).then(function(scene)
            {
//                if(scene === undefined)
//                    return undefined;
//                
//                coordCarto = new CoordCarto().setFromDegreeGeo(0,0,10);
//                scene.scene.coorCarto = coordCarto;
//                var child       = scene.scene.children[0];
//                console.log(scene);
//                console.log(child);
//                //var coorCarto   = child.position;
//                //coorCarto.z = 10000000;
//                //console.log(scene.scene);
//                console.log(this.ellipsoid);
//                var position    = this.ellipsoid.cartographicToCartesian(coordCarto);  
//                
//                var normal      = this.ellipsoid.geodeticSurfaceNormalCartographic(coordCarto);
//                
//                var quaternion  = new THREE.Quaternion();
//                quaternion.setFromAxisAngle( new THREE.Vector3(1, 0 ,0 ), Math.PI/2 );
//                
//                child.lookAt(new THREE.Vector3().addVectors ( position, normal ));
//                child.quaternion.multiply(quaternion );                
//                child.position.copy(position);
//
//                child.updateMatrix();                
//                child.visible = false; 
                
                
                
                return scene;
                //return child;
            });
        };
        
        return gLTFProvider;
});


