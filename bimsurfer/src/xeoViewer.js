define(["bimsurfer/src/xeoBIMObject.js"], function () {

    function xeoViewer(cfg) {

        // Create xeoViewer

        var domNode = document.getElementById(cfg.domNode);
        var canvas = document.createElement("canvas");

        domNode.appendChild(canvas);

        // Create a Scene
        this.scene = new XEO.Scene({ // http://xeoengine.org/docs/classes/Scene.html
            canvas: canvas
        });

        // The camera
        var camera = this.scene.camera;

        // Component for each projection type,
        // to swap on the camera when we switch projection types
        var projections = {

            persp: camera.project, // Camera has a XEO.Perspective by default

            ortho: new XEO.Ortho(this.scene, {
                left: -1.0,
                right: 1.0,
                bottom: -1.0,
                top: 1.0,
                near: 0.1,
                far: 1000
            })
        };

        // The current projection type
        var projectionType = "persp";

        // Mouse and keyboard camera control
        var cameraControl = new XEO.CameraControl(this.scene); // http://xeoengine.org/docs/classes/CameraControl.html

        // Flies cameras to objects
        var cameraFlight = new XEO.CameraFlight(this.scene); // http://xeoengine.org/docs/classes/CameraFlight.html

        // Registers loaded xeoEngine components for easy destruction
        var collection = new XEO.Collection(this.scene); // http://xeoengine.org/docs/classes/Collection.html

        // Objects mapped to IDs
        var objects = {};

        // For each RFC type, a map of objects mapped to their IDs
        var rfcTypes = {};

        /**
         * Loads random objects into the viewer for testing.
         */
        this.loadRandom = function () {

            this.clear();

            var geometry = new XEO.TorusGeometry(this.scene, { // http://xeoengine.org/docs/classes/Geometry.html
                id: "geometry.myGeometry"
            });

            collection.add(geometry);

            var roid = "foo";
            var oid = "bar";
            var type = "baz";
            var objectId;
            var matrix;

            for (var i = 0; i < 20; i++) {
                objectId = "object" + i;
                matrix = XEO.math.translationMat4c(Math.random() * 22 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
                this.createObject(roid, oid, objectId, ["myGeometry"], "foo", matrix);
            }
        };

        /**
         * Creates a geometry.
         * @param geometryId
         * @param positions
         * @param normals
         * @param colors
         * @param indices
         * @private
         */
        this.createGeometry = function (geometryId, positions, normals, colors, indices) {

            var geometry = new XEO.Geometry(this.scene, { // http://xeoengine.org/docs/classes/Geometry.html
                id: "geometry." + geometryId,
                primitive: "triangles",
                positions: positions,
                normals: normals,
                colors: colors,
                indices: indices
            });

            collection.add(geometry);
        };

        /**
         * Creates an object.
         * @param roid
         * @param oid
         * @param objectId
         * @param geometryIds
         * @param type
         * @param matrix
         * @private
         */
        this.createObject = function (roid, oid, objectId, geometryIds, type, matrix) {

            var object = new XEO.BIMObject(this.scene, {
                id: objectId,
                geometryIds: geometryIds,
                matrix: matrix
            });

            collection.add(object);

            // Register object against ID
            objects[objectId] = object;

            // Register object against IFC type
            var types = (rfcTypes[type] || (rfcTypes[type] = {}));
            types[objectId] = object;

            return object;
        };

        /**
         * Clears the viewer.
         */
        this.clear = function () {

            var list = [];

            collection.iterate(
                function (component) {
                    list.push(component);
                });

            while (list.length) {
                list.pop().destroy();
            }

            objects = {};
            rfcTypes = {};
        };

        /**
         * Sets the visibility of objects specified by ID or IFC type.
         *
         * TODO: Handle recursion for subtypes.
         *
         * @param params
         * @param params.ids IDs of objects or IFC types to update.
         * @param params.color Color to set.
         */
        this.setVisibility = function (params) {

            var ids = params.ids;

            if (!ids) {
                console.error("Param expected: ids");
                return;
            }

            //var recursive = !!params.recursive;
            var visible = params.visible !== false;

            var i;
            var len;
            var id;
            var types;
            var objectId;
            var object;

            for (i = 0, len = ids.length; i < len; i++) {

                id = ids[i];

                types = rfcTypes[id];

                if (types) {

                    for (objectId in types) {
                        if (types.hasOwnProperty(objectId)) {
                            object = types[objectId];
                            object.visibility.visible = visible;
                        }
                    }

                } else {

                    object = this.objects[id];

                    if (!object) {
                        console.error("RFC type or object not found: '" + id + "'");

                    } else {
                        object.visibility.visible = visible;
                    }
                }
            }
        };

        /**
         * Sets the color of objects specified by IDs.
         *
         * @param params
         * @param params.ids IDs of objects to update.
         * @param params.color Color to set.
         */
        this.setColor = function (params) {

            var ids = params.ids;

            if (!ids) {
                console.error("Param expected: 'ids'");
                return;
            }

            var color = params.color;

            if (!color) {
                console.error("Param expected: 'color'");
                return;
            }

            var objectId;
            var object;

            for (var i = 0, len = ids.length; i < len; i++) {

                objectId = ids[i];
                object = objects[objectId];

                if (!object) {
                    console.error("Object not found: '" + objectId + "'");

                } else {
                    object.material.diffuse = color;
                }
            }
        };

        /**
         * Sets camera state.
         *
         * @param params
         */
        this.setCamera = function (params) {

            // Set projection type

            var type = params.type;

            if (type && type !== projectionType) {

                var projection = projections[type];

                if (!projection) {
                    console.error("Unsupported camera projection type: " + type);
                } else {
                    camera.project = projection;
                    projectionType = type;
                }
            }

            // Set camera position

            if (params.eye) {
                camera.eye = params.eye;
            }

            if (params.target) {
                camera.look = params.target;
            }

            if (params.up) {
                camera.up = params.up;
            }

            // Set camera FOV angle, only if currently perspective

            if (params.fovy) {
                if (projectionType !== "persp") {
                    console.error("Ignoring update to 'fovy' for current '" + projectionType + "' camera");
                } else {
                    camera.project.fovy = params.fovy;
                }
            }

            // Set camera view volume size, only if currently orthographic

            if (params.scale) {
                if (projectionType !== "ortho") {
                    console.error("Ignoring update to 'scale' for current '" + projectionType + "' camera");
                } else {

                    // Not updating near and far clipping plane distances

                    var project = camera.project;
                    var scale = params.scale;

                    project.xmin = -scale[0];
                    project.ymin = -scale[1];

                    project.xmax = scale[0];
                    project.ymin = scale[1];
                }
            }
        };

        /**
         * Gets camera state.
         *
         * @returns {{type: string, eye: (*|Array.<T>), target: (*|Array.<T>), up: (*|Array.<T>)}}
         */
        this.getCamera = function () {

            var view = camera.view;

            return {
                type: projectionType,
                eye: view.eye.splice(),
                target: view.look.splice(),
                up: view.up.splice()
            };
        };

        this.reset = function (params) {

        };
    }

    return xeoViewer;

});