var points = [];
var minLat, minLon, maxLat, maxLon, minEle, maxEle, eleDelta;
minLat = minLon = minEle = Number.POSITIVE_INFINITY;
maxLat = maxLon = maxEle = Number.NEGATIVE_INFINITY;

var eleExageration = 300;

$.ajax( "demo.gpx" )
.done(function(data) {
	$(data).find('trkseg').each(function(si, segment) {
		$(segment).find('trkpt').each(function (pi, pt) {
			var jpt = $(pt);
			var ptf = {
				lat: jpt.attr('lat'),
				lon: jpt.attr('lon'),
				ele: jpt.find('ele').text(),
				time: moment(jpt.find('time').text())
			}
			points.push(ptf);

			if (ptf.lon<minLon) minLon = ptf.lon;
			if (ptf.lat<minLat) minLat = ptf.lat;
			if (ptf.ele<minEle) minEle = ptf.ele;
			if (ptf.lon>maxLon) maxLon = ptf.lon;
			if (ptf.lat>maxLat) maxLon = ptf.lat;
			if (ptf.ele>maxEle) maxEle = ptf.ele;
		})
	});

	eleDelta = maxEle/eleExageration;

	draw();
});

var renderer, scene, camera, controls;
var pathMesh;

function draw() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	var axisHelper = new THREE.AxisHelper( 5 );
	scene.add( axisHelper );

	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];

	controls.addEventListener( 'change', render );

	light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 0, 1 );
				scene.add( light );


	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var material = new THREE.MeshBasicMaterial({
	    color: 0xffffff,
	    wireframe: true,
	    vertexColors: THREE.VertexColors
	});

	var m2 = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } )

	var path = new THREE.PlaneGeometry(5,.1, points.length, 1);
	
	/*
	var path = new THREE.PlaneGeometry(5,.1, 5, 1);

	var x, y, v1, v2, c1, c2, ele;


	var posX = [0,1,2,3,4];
	var posY = [2,0,3,2,2];
	var r = .1;

	for (var i = 0; i < posX.length; i++) {
		v1				= path.vertices[i];
		v2				= path.vertices[posX.length + i + 1];

		var x1 = posX[i];
		var y1 = posY[i];
		var x0 = (i==0) ? posX[0] : posX[i-1];
		var y0 = (i==0) ? posY[0] : posY[i-1];
		var dx = x1-x0;
		var dy = y1-y0;
		var theta = Math.PI/2 + Math.atan2(dy, dx);
		console.log(theta)
		var xL = x1 - r*Math.cos(theta);
		var yL = y1 - r*Math.sin(theta);
		var xR = x1 + r*Math.cos(theta);
		var yR = y1 + r*Math.sin(theta);

		v1.x = xR;
		v1.y = yR;
		v2.x = xL;
		v2.y = yL;
	}
	*/

	for (var i = 0; i < points.length; i++) {
		v1				= path.vertices[i];
		v2				= path.vertices[points.length + i + 1];

		// path.colors[i] 						= new THREE.Color( 0xff0000 );
		// path.colors[points.length + i + 1]  = new THREE.Color( 0xff0000 );

		var p = points[i];

		x = p.lon - minLon;
		y = p.lat - minLat;
		x*=200;
		y*=200;
		z = (p.ele - minEle) / eleExageration;

		v1.y = y;
		v2.y= y+.2;
		v1.x = v2.x = x;
		v1.z = v2.z = z;
	}

	v1				= path.vertices[points.length];
	v2				= path.vertices[points.length*2 + 1];
	v1.x = x;
	v2.x = x+.1;
	v1.y = v2.y = y;
	v1.z = v2.z = z;


	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	var vertexIndex,n,f,color;

	for ( var i = 0; i < path.faces.length; i ++ ) {
		f = path.faces[i];
		n = ( f instanceof THREE.Face3 ) ? 3 : 4;

		for( var j = 0; j < n; j++ ) {
			vertexIndex = f[ faceIndices[ j ] ];

			p = path.vertices[ vertexIndex ];

			color = new THREE.Color( 0xffffff );
			var h = .7 - p.z/eleDelta;
			color.setHSL( h, 1.0, 0.5 );

			f.vertexColors[ j ] = color;
		}
	}
	
	// path.computeFaceNormals();
	// path.computeVertexNormals();
	path.__dirtyVertices	= true;
	path.__dirtyNormals	= true;

	pathMesh = new THREE.Mesh( path, material );
	pathMesh.dynamic = true;
	pathMesh.doubleSided	= true;
	pathMesh.rotation.x = -Math.PI/2;

	scene.add(pathMesh)


	// scene.add( new THREE.VertexNormalsHelper( pathMesh ) );

	camera.position.x = 6;
	camera.position.y = 5;
	camera.position.z = 0;
	// camera.rotation.x = -.8;
	
	animate();
}

function animate() {
	requestAnimationFrame( animate );

	// pathMesh.rotation.z -= 0.005;
	// pathMesh.position.z += 0.01;
	render();

	controls.update();

}

function render () {
	renderer.render( scene, camera );
}