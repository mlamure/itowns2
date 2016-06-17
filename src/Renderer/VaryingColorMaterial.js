/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define('Renderer/VaryingColorMaterial', ['THREE',
    'Core/defaultValue',
    'Renderer/Shader/VaryingColorVS.glsl',
    'Renderer/Shader/VaryingColorFS.glsl'
], function(
    THREE,
    defaultValue,
    VaryingColorVS,
    VaryingColorFS) {

    function VaryingColorMaterial() {
        //Constructor

        THREE.ShaderMaterial.call(this);

        this.vertexShader = VaryingColorVS;
        this.fragmentShader = VaryingColorFS;

        this.uniforms = {
            RTC: {
                type: "i",
                value: 1
            },
            mVPMatRTC: {
                type: "m4",
                value: new THREE.Matrix4()
            },
            distanceFog: {
                type: "f",
                value: 1000000000.0
            },
            uuid: {
                type: "i",
                value: 0
            },
            debug: {
                type: "i",
                value: false
            },
            selected: {
                type: "i",
                value: false
            },
            lightOn: {
                type: "i",
                value: true
            }
        };

        /*this.transparent = true;
        this.depthTest = true;
        //this.depthWrite = false;
        this.polygonOffset = true;
        this.polygonOffsetFactor = -4;
        this.polygonOffsetUnits = -1;*/
    }

    VaryingColorMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
    VaryingColorMaterial.prototype.constructor = VaryingColorMaterial;

    VaryingColorMaterial.prototype.enableRTC = function(enable) {
        this.uniforms.RTC.value = enable === true ? 1 : 0;
    };

    VaryingColorMaterial.prototype.setDebug = function(debug_value) {
        this.uniforms.debug.value = debug_value;
    };

    VaryingColorMaterial.prototype.setMatrixRTC = function(rtc) {
        this.uniforms.mVPMatRTC.value = rtc;
    };

    VaryingColorMaterial.prototype.setUuid = function(uuid) {
        this.uniforms.uuid.value = uuid;
    };

    VaryingColorMaterial.prototype.setFogDistance = function(df) {
        this.uniforms.distanceFog.value = df;
    };

    VaryingColorMaterial.prototype.setSelected = function(selected) {
        this.uniforms.selected.value = selected;
    };

    return VaryingColorMaterial;

});
