//comment about stuff
/* global THREE */
//renderKeyVisual(0.025, "imports/");

//import * as THREE from './three.module.js';
//import {GLTFExporter} from './GLTFExporter';

$.fn.renderKeyVisual = function(speed, path) {


    var _t = THREE; //writing THREE is annyoing!

    //Offset EarthPosition
    var offsetX = 0;
    var offsetY = 0;

    //rotation of everything
    var rotSpeed = speed;//0.025;

    var loadCount = 0; //max = anzahl an loadern
    var groupAdded = false;
    var scene = new _t.Scene();
    var camera = new _t.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 5, 50 );
    camera.position.z = 21; //21

    var renderer = new _t.WebGLRenderer({antialias: true, alpha: true}); //turn alpha off if not tansparent
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setClearColor( 0x000000,0.2 ); //remove later
    //document.body.appendChild( renderer.domElement );

    this.html(renderer.domElement);

    //overall rotating group
    var group = new _t.Group();


    var textureLoader = new THREE.TextureLoader();
    var textureEquirecWat = textureLoader.load( path + "hdr_water.jpg" );
    textureEquirecWat.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirecWat.magFilter = THREE.LinearFilter;
    textureEquirecWat.minFilter = THREE.LinearMipMapLinearFilter;

    var textureEquirecLand = textureLoader.load( path + "hdr_land.jpg" );
    textureEquirecLand.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirecLand.magFilter = THREE.LinearFilter;
    textureEquirecLand.minFilter = THREE.LinearMipMapLinearFilter;


    //water
    var geometry = new _t.IcosahedronBufferGeometry (1.952,5); //size, detail < aufpassen mit detail
    var matWater = new _t.MeshStandardMaterial();
    matWater.flatShading = true;
    matWater.roughness = 0.25;
    matWater.color = new _t.Color(0x0b5887) ;
    matWater.envMap = textureEquirecWat;
    matWater.envMapIntensity = 2.3;
    matWater.needsUpdate = true;
    var geoWater = new _t.Mesh( geometry, matWater );
    group.add(geoWater);

    //wireframe water
    geometry = new _t.IcosahedronBufferGeometry (1.953,5);
    var wireframe = new _t.WireframeGeometry(geometry);
    var lineMat = new _t.LineBasicMaterial({color: 0xffffff, linewidth: 1});
    var line = new _t.LineSegments(wireframe, lineMat);
    lineMat.opacity = 0.05;
    lineMat.transparent = true;
    group.add(line);

    //loader
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) {
    };

    //landmass
    var matLand = new _t.MeshStandardMaterial();
    matLand.color = new _t.Color("rgb(255,255,255)");
    matLand.roughness = 0.35;
    matLand.envMap = textureEquirecLand;
    matLand.envMapIntensity = 2.5;
    matLand.needsUpdate = true;
    var loader = new _t.OBJLoader(manager);
    loader.load (path + "landmass.obj", function (obj) {
        obj.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = matLand;
                group.add(child);
                loadCount += 1;
            }  
        }); 
    }, onProgress, onError);

    //grey tri grid ball
    var matGrid = new _t.MeshBasicMaterial({color: 0x888888});
    matGrid.side = _t.DoubleSide;
    matGrid.transparent = true;
    matGrid.opacity = 0.5;
    var loader2 = new _t.OBJLoader(manager);
    loader2.load (path + "tri_grid.obj", function(obj){
        obj.traverse( function (child){
            if (child instanceof THREE.Mesh) {
                child.material = matGrid;
                group.add(child);
                loadCount += 1;
            }
        });
    }, onProgress, onError);

    //blubz outside of grid ball
    var texBlubs = new _t.TextureLoader().load(path + "blubs_a.png");
    var matBlubs = new _t.MeshBasicMaterial({
        color: 0x000000,
        side: _t.DoubleSide,
        alphaMap: texBlubs,
        transparent: true
    });
    var loader3 = new _t.OBJLoader(manager);
    loader3.load (path + "blubs.obj", function(obj){
        obj.traverse( function (child){
            if (child instanceof THREE.Mesh) {
                child.material = matBlubs;
                group.add(child);
                loadCount += 1;
            }
        });
    }, onProgress, onError);

    //all the hub object stuff
    var hubGroup = new _t.Group();
    var texHubD = new _t.TextureLoader().load(path + "hubs_dif.jpg");
    var texHubA = new _t.TextureLoader().load(path + "hubs_a.jpg");
    var matHub = new _t.MeshBasicMaterial({
        map: texHubD,
        alphaMap: texHubA,
        transparent: true
    });
    var matHubFade = false;
    //small hubs + main hubs
    var loader4 = new _t.OBJLoader(manager);
    loader4.load (path + "hub_mesh.obj", function(obj){
        obj.traverse( function (child){
            if (child instanceof THREE.Mesh) {
                child.material = matHub;
                hubGroup.add(child.clone());

                child.scale.set (1, 1, 1);

                //st petersburg?
                child.position.set(0.651, 1.708, 0.726);
                child.rotation.set(_t.Math.degToRad(10),_t.Math.degToRad(320),_t.Math.degToRad(-20));
                group.add(child.clone());
                //middle east
                child.position.set(1.26, 1.068, 1.09);
                child.rotation.set(_t.Math.degToRad(81),_t.Math.degToRad(20),_t.Math.degToRad(-51));
                group.add(child.clone());
                //africa 1
                child.position.set(0.106, 0.251, 1.952);
                child.rotation.set(_t.Math.degToRad(105),_t.Math.degToRad(0),_t.Math.degToRad(0));
                group.add(child.clone());
                //africa 2
                child.position.set(1.573, 0.084, 1.182);
                child.rotation.set(_t.Math.degToRad(0),_t.Math.degToRad(-40),_t.Math.degToRad(-90));
                group.add(child.clone());
                //africa 3
                child.position.set(0.939, -0.951, 1.452);
                child.rotation.set(_t.Math.degToRad(-3),_t.Math.degToRad(-46),_t.Math.degToRad(-146));
                group.add(child.clone());
                //AUS
                child.position.set(0.571, -1.068, -1.585);
                child.rotation.set(_t.Math.degToRad(240),_t.Math.degToRad(0),_t.Math.degToRad(-30));
                group.add(child.clone());
                //SA 1
                child.position.set(-1.26, -0.123, 1.54);
                child.rotation.set(_t.Math.degToRad(101),_t.Math.degToRad(0),_t.Math.degToRad(45));
                group.add(child.clone());
                //SA 2
                child.position.set(-1.606, -0.434, 1.06);
                child.rotation.set(_t.Math.degToRad(117),_t.Math.degToRad(0),_t.Math.degToRad(64));
                group.add(child.clone());
                //SA3
                child.position.set(-1.246, -1.075, 1.103);
                child.rotation.set(_t.Math.degToRad(151),_t.Math.degToRad(0),_t.Math.degToRad(36));
                group.add(child);

                loadCount += 1;
            }
        });
    }, onProgress, onError);
    //main hubs
    var loader5 = new _t.OBJLoader(manager);
    loader5.load (path + "hub_fins.obj", function(obj){
        obj.traverse( function (child){
            if (child instanceof THREE.Mesh) {
                child.material = matHub;
                hubGroup.add(child);
                hubGroup.scale.set(1.5,1.5,1.5);
                //madrid
                hubGroup.position.set(0.225, 1.287, 1.488);
                hubGroup.rotation.set(_t.Math.degToRad(45),_t.Math.degToRad(65),_t.Math.degToRad(0));
                group.add(hubGroup.clone());
                //hamburg
                hubGroup.position.set(0.44, 1.554, 1.121);
                hubGroup.rotation.set(_t.Math.degToRad(105),_t.Math.degToRad(81),_t.Math.degToRad(290));
                group.add(hubGroup.clone());
                //NY
                hubGroup.position.set(-1.306, 1.321, 0.676);
                hubGroup.rotation.set(_t.Math.degToRad(-110),_t.Math.degToRad(25),_t.Math.degToRad(127));
                group.add(hubGroup.clone());
                //mumbai
                hubGroup.position.set(1.854, 0.664, 0.187);
                hubGroup.rotation.set(_t.Math.degToRad(330),_t.Math.degToRad(-10),_t.Math.degToRad(280));
                group.add(hubGroup.clone());
                //hong kong
                hubGroup.position.set(1.492, 0.811, -1.042);
                hubGroup.rotation.set(_t.Math.degToRad(60),_t.Math.degToRad(30),_t.Math.degToRad(250));
                group.add(hubGroup);

                loadCount += 1;
            }
        });
    }, onProgress, onError);

    //particle sphere
    var partSphere = new _t.IcosahedronBufferGeometry(2.2, 4);
    var particles = new THREE.Points(partSphere, new _t.PointsMaterial({
      color: 0x00ffff,
      size: 0.075
    }));
    partSphere = new _t.IcosahedronBufferGeometry(2.2, 5);
    var particles2 = new THREE.Points(partSphere, new _t.PointsMaterial({
      color: 0x00ffff,
      size: 0.04
    }));
    group.add(particles);
    group.add(particles2);

    //curves
    var splineMat = new _t.LineBasicMaterial ({color: 0x00ffff});
    var splinesCoords = [
    [
        // spline 1 coords NY > Madrid
        [-1.306, 1.321, 0.676],
        [-1.15, 2.2, 1.1],
        [-0.28, 2, 1.7],
        [0.225, 1.287, 1.488]
    ],[
        // spline 2 coords Hamb > Mumbai
        [0.44, 1.554, 1.121],
        [1.65, 1.8, 1.6],
        [2.6, 1.1, 0.8],
        [1.854, 0.664, 0.187]
    ],[
        // spline 3 coords HK > Hamb
        [1.492, 0.811, -1.042],
        [2.31, 1.82, -0.35],
        [1.6, 2.5, 0.8],
        [0.44, 1.554, 1.121]
    ],[
        // spline 4 coords Hamb > NY
        [0.44, 1.554, 1.121],
        [0.25, 2.46, 1.5],
        [-1, 2.44, 0.86],
        [-1.306, 1.321, 0.676]
    ],[
        // spline 5 coords NY > Sydney
        [-1.306, 1.321, 0.676],
        [-4.2, 2.5, 0.7],
        [0.85, -0.78, -4.50],
        [0.571, -1.068, -1.585]
    ],[
        // spline 6 coords Sydney > Mumbai
        [0.571, -1.068, -1.585],
        [2, -0.8, -2.75],
        [3, 0.68, -0.6],
        [1.854, 0.664, 0.187]
    ]
    ,[
        // spline 7 coords Madrid > Hong Kong
        [0.225, 1.287, 1.488],
        [1.36, 2.16, 1.81],
        [2.76, 1.6, -0.53],    
        [1.492, 0.811, -1.042]
    ]
    ,[
        // spline 8 coords NY > SA3
        [-1.306, 1.321, 0.676],
        [-2.30, 1.24, 1.9],
        [-2.7, -0.62, 2.6],
        [-1.246, -1.075, 1.103]
    ]
    ,[
        // spline 9 coords Madrid > Africa3
        [0.225, 1.287, 1.488],
        [1, 1.4, 2.45],
        [1.55, -0.7, 2.69],
        [0.939, -0.951, 1.452]
    ]
    ,[
        // spline 10 coords Madrid > SA1
        [0.225, 1.287, 1.488],
        [-0.14, 1.23, 3],
        [-0.92, 0.5, 3],
        [-1.26, -0.123, 1.54]
    ]
    ];

    var spline = splinesCoords.map(function(e) {
        var p = e.map(function(v){ return new _t.Vector3(v[0],v[1],v[2]); });
        var s = new _t.CubicBezierCurve3(p[0],p[1],p[2],p[3]);
        var geo = new _t.BufferGeometry().setFromPoints(s.getPoints(s.getLength()*7));
        var obj = new _t.Line(geo, splineMat);
        group.add(obj);
        return s;
    });

    //spline Particles
    var texPartA = new _t.TextureLoader().load(path + "part.png");
    var partMat3 = new _t.PointsMaterial({
        color: 0x00ffff,
        size: 0.125,
        map: texPartA,
        transparent: true,
        depthWrite: false
    });     

    var partGeo = spline.map(function(s) {
        var p = new _t.Geometry();
        var i = s.getLength()*15 - (s.getLength()*15) % 1;
        for (var j = 0; j<i; j++){
            p.vertices.push(s.getPointAt(j/i));
        }
        var ps = new _t.Points(p, partMat3);
        group.add(ps);
        return p;
    });



    var mouseX = 0, mouseY = 0,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2;

    //resize
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    //mouse
    window.addEventListener( 'mousemove', onDocumentMouseMove, false);
    function onDocumentMouseMove( event ) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    var xTilt = 0;
    var yTilt = 0;
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
            yTilt = event.beta;  // In degree in the range [-180,180]
            xTilt = -event.gamma; // In degree in the range [-90,90]

            // Swap x and y in Landscape orientation
            if (Math.abs(window.orientation) === 90) {
                var a = xTilt;
                xTilt = yTilt;
                yTilt = a;
            }
            // Invert x and y in upsidedown orientations
            if (window.orientation < 0) {
                xTilt = -xTilt;
                yTilt = -yTilt;
            }

        }, true);
    }

    var clock = new _t.Clock();
    var deltaTime = 1;
    var offsetP = 0;

    var offsetCX = 0;
    var camPosX = 0;
    var offsetCY = 0;
    var camPosY = 0;

    var maxVelo = 0;
    var update = function() {
        requestAnimationFrame( update );
        deltaTime = Math.min(Math.max(clock.getDelta(),0.005), 0.5);

        if (loadCount === 5) {
            if (!groupAdded) {
                scene.add(group);
                group.position.x = offsetX;
                group.position.y = offsetY;
                groupAdded = true;
            }
            camPosX = ( - mouseX - xTilt*10 + 20 - camera.position.x ) * -.00025;
            camPosY = ( - mouseY - yTilt*10 + 20 - camera.position.y ) * .00045;

            if (camPosX + offsetCX !== 0) {
                offsetCX -= (camPosX + offsetCX)* 0.5*deltaTime;
                camPosX = Math.min(Math.max(camPosX + offsetCX, -0.5), 0.5);
            }
            if (camPosY + offsetCY !== 0) {
                offsetCY -= (camPosY + offsetCY)*0.5*deltaTime;
                camPosY = Math.min(Math.max(camPosY + offsetCY, -0.5), 0.5);
            }
            var velocityX = camPosX - camera.position.x;
            var velocityY = camPosY - camera.position.y;
            camera.position.x += velocityX*deltaTime;
            camera.position.y += velocityY*deltaTime;
            camera.position.x = Math.min(Math.max(camera.position.x, -0.25),0.25);
            camera.position.y = Math.min(Math.max(camera.position.y, -0.25),0.25);
            //camera.lookAt( scene.position );

            group.rotation.y += rotSpeed * deltaTime;

            offsetP += deltaTime*rotSpeed*1;
            if (offsetP > 1){
                offsetP -= 1;            
            }
            for (var i = 0; i<partGeo.length; i++){
                for (var j = 0; j<partGeo[i].vertices.length; j++){
                    var posIndex = (j/partGeo[i].vertices.length) + offsetP;
                    if (posIndex > 1){
                        posIndex -= 1;
                    }
                    partGeo[i].vertices[j] = spline[i].getPointAt(posIndex);
                }
                partGeo[i].verticesNeedUpdate = true;
            }
            //group.rotation.y = _t.Math.degToRad(20);
        }
        renderer.render( scene, camera );
    };
    update();



//Guardar en formato glb

//var btn = document.createElement('button');
//document.body.appendChild(btn);
//btn.textContent = 'Descargar';
//btn.onclick = download;

/*
const btn = document.getElementById('download-glb');
btn.addEventListener('click', download);

function download(input) {

  //import GLTFExporter from './GLTFExporter.js';
  //import * as GLTFExporter from './GLTFExporter.js';
  //import GLTFExporter from _t.GLTFExporter;
//import * as THREE from 'three';
//import {GLTFExporter} from './GLTFExporter.js';
//System.import {GLTFExporter} from './GLTFExporter.js';

  //const exporter = new GLTFExporter();

   //var exporter = GLTFExporter();
  
  const options = {
                binary: true,
                maxTextureSize: 4096,
                animations: [animationClip],
                includeCustomExtensions: true
            };
    console.log(options);

    exporter.parse(input, function (result) {
                    if ( result instanceof ArrayBuffer ) {

                        saveArrayBuffer( result, 'scene.glb' );

                    } else {

                        const output = JSON.stringify( result, null, 2 );
                        console.log( output );
                        saveString( output, 'scene.gltf' );

                    }

                }, options );
}


document.getElementById('download-glb').addEventListener('click', function () {
                download(scene);

            } );

/*
  exporter.parse(scene, function (result) {
      saveArrayBuffer(result, 'scene.glb')
    },
     {binary: true} 
  )
*/

/*
function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // URL.revokeObjectURL( url ); breaks Firefox...
}


*/
};


