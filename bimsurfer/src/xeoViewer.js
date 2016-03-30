define(["bimsurfer/src/DefaultMaterials.js", "bimsurfer/src/xeoBIMObject.js"], function (DefaultMaterials) {

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

            var geometry = new XEO.BoxGeometry(this.scene, { // http://xeoengine.org/docs/classes/Geometry.html
                id: "geometry.myGeometry"
            });

            collection.add(geometry);

            var roid = "foo";
            var oid;
            var type;
            var objectId;
            var matrix;
            var types = Object.keys(DefaultMaterials);

            for (var i = 0; i < 50; i++) {
                objectId = "object" + i;
                oid = objectId;
                matrix = XEO.math.translationMat4c(Math.random() * 22 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
                type = types[Math.round(Math.random() * types.length)];
                this.createObject(roid, oid, objectId, ["myGeometry"], type, matrix);
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

            var color = DefaultMaterials[type] || DefaultMaterials["DEFAULT"];

            object.material.diffuse = [color[0], color[1], color[2]];

            if (color[3] < 1) { // Transparent object
                object.material.opacity = color[4];
                object.modes.transparent = true;
            }

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

            params = params || {};

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

            params = params || {};

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

            params = params || {};

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
                camera.view.eye = params.eye;
            }

            if (params.target) {
                camera.view.look = params.target;
            }

            if (params.up) {
                camera.view.up = params.up;
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

                    project.left = -scale[0];
                    project.bottom = -scale[1];
                    project.right = scale[0];
                    project.top = scale[1];
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

            var json = {
                type: projectionType,
                eye: view.eye.splice(0),
                target: view.look.splice(0),
                up: view.up.splice(0)
            };

            var project = camera.project;

            if (projectionType === "persp") {
                json.fovy = project.fovy;

            } else if (projectionType === "ortho") {
                json.size = [1, 1, 1]; // TODO: efficiently derive from cached value or otho volume
            }

            return json;
        };

        /**
         *
         * @param params
         */
        this.viewFit = function (params) {

            params = params || {};

            var ids = params.ids;

            if (!ids || ids.length === 0) {

                if (params.animate) {
                    cameraFlight.flyTo(this.scene);

                } else {
                    cameraFlight.jumpTo(this.scene);
                }

            } else {

               var aabb = getObjectsAABB(ids);

                if (params.animate) {

                    cameraFlight.flyTo({
                        aabb: aabb
                    });

                } else {

                    cameraFlight.jumpTo({
                        aabb: aabb
                    });
                }
            }
        };

        // Returns an axis-aligned bounding box (AABB) that encloses the given objects
        function getObjectsAABB(ids) {

            var aabb = XEO.math.AABB3();

            var xmin = 100000;
            var ymin = 100000;
            var zmin = 100000;
            var xmax = -100000;
            var ymax = -100000;
            var zmax = -100000;

            var objectId;
            var object;
            var i;
            var len;
            var worldBoundary;
            var min;
            var max;

            for (i = 0, len = ids.length; i < len; i++) {

                objectId = ids[i];
                object = objects[objectId];

                if (!object) {
                    continue;
                }

                worldBoundary = object.worldBoundary;
                if (!worldBoundary) {
                    continue;
                }

                aabb = worldBoundary.aabb;

                min = aabb.min;
                max = aabb.max;

                if (min[0] < xmin) {
                    xmin = min[0];
                }

                if (min[1] < ymin) {
                    ymin = min[1];
                }

                if (min[2] < zmin) {
                    zmin = min[2];
                }

                if (max[0] > xmax) {
                    xmax = max[0];
                }

                if (max[1] > ymax) {
                    ymax = max[1];
                }

                if (max[2] > zmax) {
                    zmax = max[2];
                }
            }

            aabb.min[0] = xmin;
            aabb.min[1] = ymin;
            aabb.min[2] = zmin;
            aabb.max[0] = xmax;
            aabb.max[1] = ymax;
            aabb.max[2] = zmax;

            return aabb;
        }

        this.reset = function (params) {

        };
    }

    return xeoViewer;

});