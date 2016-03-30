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

Setting the camera position:

````javascript
bimSurfer.setCamera({ 
    eye: [-20,0,20],
    target: [0,10,0],
    up: [0,1,0]
});
````

Setting the camera projection to orthographic:

````javascript
bimSurfer.setCamera({ 
    type:"ortho"
});
````

Setting the view volume size for orthographic, switching to orthographic projection first if necessary:

````javascript
bimSurfer.setCamera({ 
    type:"ortho", 
    scale: [10,10,10]
});
````

Setting the camera projection to perspective:

````javascript
bimSurfer.setCamera({ 
    type:"persp"
});
````

Setting the FOV on Y-axis for perspective, switching to perspective projection first if necessary:

````javascript
bimSurfer.setCamera({ 
    type:"persp", 
    fovy: 65
});
````

Querying camera state:

````javascript
var camera = bimSurfer.getCamera();
````

The returned value would be:

````json
{
    "type": "persp",
    "eye": [-20,0,20],
    "target": [0,10,0],
    "up": [0,1,0],
    "fovy": 65
}
````
 
### Flying the camera to objects

Flying the camera to fit specified objects in view:

````json
bimSurfer.viewFit({ids: ["object3", "object1", "object6"], animate: true });
````

Jumping the camera to fit specified objects in view:

````json
bimSurfer.viewFit({ids: ["object1", "object6"], animate: false });
````

Flying the camera to fit all objects in view:

````json
bimSurfer.viewFit({ animate: true });
````

### Camera interaction
 

