/**
 * Generated On: 2016-05-18
 * Class: FlatCameraControls
 * Description: Permet le control de la camera.
 * Sur click gauche de la souris translation suivant les deux axes x et y lors de l'actionnement de la souris.
 * Sur click gauche de la souris et appuie de ctrl rotation autour des axes z et y lors de l'actionnement de la souris.
 * Sur actionnement de la molette de la souris, zoom ou dezoom.
 * Sur click droit de la souris translation suivant l'axe z lors de l'actionnement de la souris.
 * Sur appuie des touches R/F translation suivant l'axe z lors de l'actionnement de la souris.
 */

define('Renderer/ThreeExtented/FlatCameraControls',[
		'Scene/Node',
		'THREE'
	],function(Node, THREE) {

		var scope = null;

		var keys 			= {CTRL: 17, R: 82, F: 70};
		var mouseButtons 	= {LEFTCLICK: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, RIGHTCLICK: THREE.MOUSE.RIGHT};

		var STATE 		= {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, PANUP: 3};
		var state 		= STATE.NONE;

		var isCtrlDown 	= false;

		var rotateStart = new THREE.Vector2();
		var rotateEnd 	= new THREE.Vector2();
		var rotateDelta	= new THREE.Vector2();

		var theta 		= 0;
		var phi 		= 0;
		var thetaDelta 	= 0;
		var phiDelta	= 0;

		var panStart 	= new THREE.Vector2();
		var panEnd 		= new THREE.Vector2();
		var panDelta	= new THREE.Vector2();

		var panOffset 	= new THREE.Vector3();
		var panUpOffset	= new THREE.Vector3();

		var dollyStart 	= new THREE.Vector2();

		var scale 		= 1;
		var oldScale	= 1;

		var changeEvent = {type: 'change'};

		function FlatCameraControls(camera, domElement) {
			//Constructor

			Node.call(this);

			scope = this;

			this.camera 		= camera;
			this.domElement 	= domElement;

			this.target 		= new THREE.Vector3();

			this.minDistanceUp	= 0;
			this.maxDistanceUp	= Infinity;

			this.minScale 		= 0;
			this.maxScale	 	= Infinity;

			this.minZoom 		= 0;
			this.maxZoom 		= Infinity;

			this.minZenithAngle = 0;
			this.maxZenithAngle = Math.PI;

			this.zoomSpeed 		= Math.pow(0.95, 1.0);

			//**********************Keys***********************//
			window.addEventListener('keydown', this.onKeyDown, false);

			//**********************Mouse**********************//
			this.domElement.addEventListener('mousedown', this.onMouseDown, false);
			this.domElement.addEventListener('mousewheel', this.onMouseWheel, false);
			//For firefox
			this.domElement.addEventListener('MozMousePixelScroll', this.onMouseWheel, false);

			//**********************Touch**********************//

			this.update();
		}

		FlatCameraControls.prototype = Object.create(THREE.EventDispatcher.prototype);
		FlatCameraControls.prototype.constructor = FlatCameraControls;

		//Public functions

		/**
         * Manage the rotation of the camera around the y and z axis. Change their offset values.
         * @param deltaX : the offset value of the mouse movement along the X axis.
         * @param deltaY : the offset value of the mouse movement along the Y axis.
         */
		FlatCameraControls.prototype.rotate = function(deltaX, deltaY) {

			thetaDelta 	-= 2 * Math.PI * deltaX / scope.domElement.clientHeight;
			phiDelta	-= 2 * Math.PI * deltaY / scope.domElement.clientHeight;
		}

		/**
         * Manage the translation of the camera along the horizontal (go left or right) line of the world.
         * @param distance : the distance to the target point depending of the windows height.
         * @param matrix : the matrix of the camera.
         */
		FlatCameraControls.prototype.panLeft = function(distance, matrix) {

			var vector = new THREE.Vector3();

			vector.setFromMatrixColumn(matrix, 0);
			vector.multiplyScalar(- distance);

			panOffset.add(vector);
		}

		/**
         * Manage the translation of the camera along the horizontal (go forward or backward) line of the world.
         * @param distance : the distance to the target point depending of the windows height.
         * @param matrix : the matrix of the camera.
         */
		FlatCameraControls.prototype.panForward = function(distance, matrix) {

			var vector = new THREE.Vector3();

			if(theta === 0){
				vector.setFromMatrixColumn(matrix, 1);
				vector.multiplyScalar(distance);
			}
			else{
				vector.set(Math.sin(theta), Math.cos(theta),0);
				vector.multiplyScalar(- distance);
			}


			panOffset.add(vector);
		}

		/**
         * Manage the translation of the camera along the vertical (go up or down) line of the world.
         * @param deltaYX : the offset value of the mouse movement along the Y axis.
         */
		FlatCameraControls.prototype.panUp = function(deltaY) {

			var offset 			= scope.camera.position.clone().sub(scope.target);
			var targetDistance 	= offset.length();
			targetDistance 	   *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);

			var vector = new THREE.Vector3(0,0,1);
			vector.multiplyScalar(2 * deltaY * targetDistance / scope.domElement.clientHeight);

			panUpOffset.add(vector);
		}

		/**
         * Manage the translation of the camera along the horizontal line of the world.
         * @param deltaX : the offset value of the mouse movement along the X axis.
         * @param deltaY : the offset value of the mouse movement along the Y axis.
         */
		FlatCameraControls.prototype.pan = function(deltaX, deltaY) {

			var position 		= scope.camera.position;
			var offset 			= position.clone().sub(scope.target);
			var targetDistance 	= offset.length();

			targetDistance 	   *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);

			scope.panLeft	(2 * deltaX * targetDistance / scope.domElement.clientHeight, scope.camera.matrix);
			scope.panForward(2 * deltaY * targetDistance / scope.domElement.clientHeight, scope.camera.matrix);
		}

		/**
         * Manage the translation of the camera along the horizontal line of the world.
         * @param deltaX : the offset value of the mouse movement along the X axis.
         * @param deltaY : the offset value of the mouse movement along the Y axis.
         */
		FlatCameraControls.prototype.update = function() {

			var quat = new THREE.Quaternion().setFromUnitVectors( scope.camera.up, new THREE.Vector3( 0, 0, 1 ) );
			var quatInverse = quat.clone().inverse();

			var position 		= scope.camera.position;
			var offset 			= new THREE.Vector3();
			offset.copy(position).sub(scope.target);

			//Handle dolly
			scale 	= Math.max(scope.minScale, Math.min(scope.maxScale, scale));

			//Handle rotation
			if(thetaDelta !== 0 || phiDelta !== 0) {

				if((phi + phiDelta >= scope.minZenithAngle)
					&& (phi + phiDelta <= scope.maxZenithAngle)
					&& phiDelta !== 0) {

					offset.applyQuaternion(quat);
					phi 	+= phiDelta;

					var rotationXQuaternion = new THREE.Quaternion();
					var vector = new THREE.Vector3();
					vector.setFromMatrixColumn(scope.camera.matrix, 0);
					rotationXQuaternion.setFromAxisAngle(vector, phiDelta);
					offset.applyQuaternion(rotationXQuaternion);
					offset.applyQuaternion(quatInverse);
				}

				if(thetaDelta !== 0) {
					theta 	= Math.atan2(offset.x, offset.y);
					theta 	+= thetaDelta;

					var rotationZQuaternion = new THREE.Quaternion();
					rotationZQuaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), thetaDelta);
					offset.applyQuaternion(rotationZQuaternion);
				}
			}

			//Handle dolly
			var currentScale = scale / oldScale;
			offset.multiplyScalar(currentScale);

			//Move the target to the panned location
			scope.target.add(panOffset);
			if((position.z + panUpOffset.z > scope.minDistanceUp) && (position.z + panUpOffset.z < scope.maxDistanceUp))
				scope.target.add(panUpOffset);

			position.copy(scope.target).add(offset);

			//Handle pan up
			/*if((position.z + panUpOffset.z > scope.minDistanceUp) && (position.z + panUpOffset.z < scope.maxDistanceUp))
				position.add(panUpOffset);*/

			//Always look at the target
			scope.camera.lookAt(scope.target);

			//Reset elements
			thetaDelta  = 0;
			phiDelta	= 0;
			oldScale 	= scale;
			panOffset	.set(0, 0, 0);
			panUpOffset	.set(0, 0, 0);

			scope.dispatchEvent(changeEvent);
		};

		//*************************************************************************************//
		//************************************ Event handlers *********************************//
		//*************************************************************************************//

		//**********************Keys***********************//

		/**
         * Manage the event when a key is down.
         * @param event: the current event
         */
		FlatCameraControls.prototype.handleKeyDown = function(event) {

			switch (event.keyCode) {
				case keys.CTRL:
					if(!isCtrlDown)
						isCtrlDown = true;
					break;
				case keys.R:
					//Get the camera up
					scope.panUp(3);
					scope.update();
					break;
				case keys.F:
					//Get the camera down
					scope.panUp(-3);
					scope.update();
					break;
				default:
			}
		};

		//**********************Mouse**********************//

		/**
         * Handle the left mouse down event mixed with the ctrl event. Get the specified datas from the movement of
         * the mouse along both x and y axis. Init the rotate value to the position of the mouse during the event.
         * @param event : the mouse down event mixed with the ctrl down event.
         */
		FlatCameraControls.prototype.handleMouseDownRotate = function(event) {

			rotateStart.set(event.clientX, event.clientY);
		};

		/**
         * Handle the left mouse down event. Get the specified datas from the movement of the mouse along both x and y axis.
         * Init the pan value to the position of the mouse during the event.
         * @param event : the mouse down event.
         */
		FlatCameraControls.prototype.handleMouseDownPan = function(event) {

			panStart.set(event.clientX, event.clientY);
		};

		/**
         * Handle the left mouse down event. Get the specified datas from the movement of the mouse along both x and y axis.
         * Init the dolly value to the position of the mouse during the event.
         * @param event : the mouse down event.
         */
		FlatCameraControls.prototype.handleMouseDownDolly = function(event) {

			dollyStart.set(event.clientX, event.clientY);
		};

		/**
         * Handle the mouse wheel actionned event. Get the specified data from the movement of the wheel. compute the scale
         * (zoom) value and update the camera controls.
         * @param event : the mouse wheel event.
         */
		FlatCameraControls.prototype.handleMouseWheel = function(event) {

			var delta = 0;

			if(event.wheelDelta !== undefined) {
				delta = event.wheelDelta;
			} else if (event.detail !== undefined) {
				delta = - event.detail;
			}

			if(delta > 0) {
				scale *= scope.zoomSpeed;
			}
			else {
				scale /= scope.zoomSpeed;
			}

			scope.update();
		};

		/**
         * Handle the mouse move event mixed with the ctrl event. Get the specified datas from the movement of the mouse
         * along both x and y axis. Compute the rotate value and update the camera controls.
         * @param event : the mouse move event mixed with the ctrl down event.
         */
		FlatCameraControls.prototype.handleMouseMoveRotate = function(event) {

			rotateEnd.set(event.clientX, event.clientY);
			rotateDelta.subVectors(rotateEnd, rotateStart);

			scope.rotate(rotateDelta.x, rotateDelta.y);

			rotateStart.copy(rotateEnd);

			scope.update();
		};

		/**
         * Handle the mouse move event. Get the specified datas from the movement of the mouse along both x and y axis.
         * Compute the pan value and update the camera controls.
         * @param event : the mouse move event.
         */
		FlatCameraControls.prototype.handleMouseMovePan = function(event) {

			panEnd.set(event.clientX, event.clientY);
			panDelta.subVectors(panEnd, panStart);

			if(state === STATE.PAN)
				scope.pan(panDelta.x, panDelta.y);
			else if (state === STATE.PANUP)
				scope.panUp(panDelta.y);

			panStart.copy(panEnd);

			scope.update();
		};

		//**********************Touch**********************//

		//*************************************************************************************//
		//************************************ Event catchers *********************************//
		//*************************************************************************************//

		//**********************Keys***********************//

		/**
         * Catch and manage the event when a key is down.
         * @param event: the current event
         */
		FlatCameraControls.prototype.onKeyDown = function(event) {

			scope.handleKeyDown(event);
			window.addEventListener('keyup', scope.onKeyUp, false);
		};

		/**
         * Catch and manage the event when a key is up.
         * @param event: the current event
         */
		FlatCameraControls.prototype.onKeyUp = function(event) {

			if(event.keyCode == keys.CTRL)
			{
				isCtrlDown = false;
				window.removeEventListener('keyup', scope.onKeyUp, false);
			}
		};

		//**********************Mouse**********************//

		/**
         * Catch and manage the event when a touch on the mouse is down.
         * @param event: the current event (mouse left button clicked or mouse wheel button actionned)
         */
		FlatCameraControls.prototype.onMouseDown = function(event) {

			//Disable default action of this event
			event.preventDefault();

			if(event.button === mouseButtons.LEFTCLICK) {
				if(isCtrlDown) {
					scope.handleMouseDownRotate(event);
					state = STATE.ROTATE;
				}
				else {
					scope.handleMouseDownPan(event);
					state = STATE.PAN;
				}
			}else if (event.button === mouseButtons.ZOOM) {
				scope.handleMouseDownDolly(event);
				state = STATE.DOLLY;
			}else if (event.button === mouseButtons.RIGHTCLICK) {
				scope.handleMouseDownPan(event);
				state = STATE.PANUP;
			}

			if (state != STATE.NONE) {
				scope.domElement.addEventListener('mousemove', scope.onMouseMove, false);
				scope.domElement.addEventListener('mouseup', scope.onMouseUp, false);
			}
		};

		/**
         * Catch the event when a touch on the mouse is uped. Reinit the state of the controller and disable.
         * the listener on the move mouse event.
         * @param event: the current event
         */
		FlatCameraControls.prototype.onMouseUp = function(event) {

			event.preventDefault();

			scope.domElement.removeEventListener('mousemove', scope.onMouseMove, false);
			scope.domElement.removeEventListener('mouseup', scope.onMouseUp, false);

			state = STATE.NONE;
		};

		/**
         * Catch and manage the event when the mouse wheel is rolled.
         * @param event: the current event
         */
		FlatCameraControls.prototype.onMouseWheel = function(event) {

			event.preventDefault();
			event.stopPropagation();

			scope.handleMouseWheel(event);
		};

		/**
         * Catch and manage the event when the mouse is moved, depending of the current state of the controller.
         * Can be called when the state of the controller is different of NONE.
         * @param event: the current event
         */
		FlatCameraControls.prototype.onMouseMove = function(event) {

			event.preventDefault();

			if (state === STATE.ROTATE)
				scope.handleMouseMoveRotate(event);
			else if (state === STATE.PAN)
				scope.handleMouseMovePan(event);
			else if (state === STATE.PANUP)
				scope.handleMouseMovePan(event);
		};

		//**********************Touch**********************//

		return FlatCameraControls;
	}
);
