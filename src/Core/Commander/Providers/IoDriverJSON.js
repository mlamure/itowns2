/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define('Core/Commander/Providers/IoDriverJSON',['Core/Commander/Providers/IoDriver','when'], function(IoDriver,when){


    function IoDriverJSON(){
        //Constructor
        IoDriver.call( this );

    }

    IoDriverJSON.prototype = Object.create( IoDriver.prototype );

    IoDriverJSON.prototype.constructor = IoDriverJSON;

    IoDriverJSON.prototype.read = function(url)
    {

        var deferred = when.defer();

        var xhr = new XMLHttpRequest();

        xhr.open("GET", url,true);

        xhr.responseType = "json";

        xhr.crossOrigin  = '';

        xhr.onload = function () {
            deferred.resolve(this.response);
        };

        xhr.onerror = function(){
            deferred.reject(Error("Error IoDriverJSON"));
        };

        xhr.send(null);

        return deferred;


    };

    return IoDriverJSON;

});
