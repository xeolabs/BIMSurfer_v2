# Introduction

BIMSurfer is a WebGL-based 3D viewer for [BIMServer]() that's built on [xeoEngine](http://xeoengine.org).
    
# Usage

## BIMSurfer

Creating a [BIMSurfer](bimsurfer/src/BimSurfer.js): 

````javascript
var bimSurfer = new BimSurfer({
    domNode: "viewerContainer"
});
````

Loading a model from BIMServer:
 
````javascript
bimSurfer.load({
        bimserver: ADDRESS,
        username: USERNAME,
        password: PASSWORD,
        poid: 131073,
        roid: 65539,
        schema: "ifc2x3tc1" // < TODO: Deduce automatically
    })
        .then(function (model) {
        
                // Model is now loaded and rendering.
                // The following sections show what you can do with BIMSurfer at this point.
                //...
            });
````

## Objects

### Selecting and deselecting objects

TODO:  

### Showing and hiding objects

TODO

### Changing the color of objects

TODO

### Changing the transparency of an object

TODO

### Clearing objects
 
TODO

## Camera
  
### Controlling the camera
 
### Flying the camera to objects


### Camera interaction
 

