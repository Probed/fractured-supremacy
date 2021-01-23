var fs_Sphere = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    stats: Class.empty,
    imgs: Class.empty,
    preloader: Class.empty,
    preloadPercent: Class.empty,
    globeDoms: Class.empty,
    vertices: Class.empty,

    world: Class.empty,
    globe: Class.empty,
    globeContainer: Class.empty,
    globePole: Class.empty,
    globeHalo: Class.empty,

    pixelExpandOffset: 1.5,
    rX: 0,
    rY: 0,
    rZ: 0,
    sinRX: Class.empty,
    sinRY: Class.empty,
    sinRZ: Class.empty,
    cosRX: Class.empty,
    cosRY: Class.empty,
    cosRZ: Class.empty,
    dragX: Class.empty,
    dragY: Class.empty,
    dragLat: Class.empty,
    dragLng: Class.empty,
    transformStyleName: Class.empty,
    options: {
	bg: null,
	globe: null,
	halo: null,
	size: 1072 / 2,
	globe_image_width: 1600,
	globe_image_height: 800,
	percent: 0,
	lat: 20,
	lng: -90,
	segX: 28,
	segY: 16,
	halovis: false,
	polevis: false,
	autoSpin: false,
	zoom: 0,
	skipPreloaderAnimation: false,
    },
    initialize: function (options) {
	this.setOptions(options);
	this.cont = new Element('div', {
	    'class': 'fs_Sphere',
	    style: 'position:absolute;'
	});
	if (this.options['top-pos']) {
	    this.cont.style.top = this.options['top-pos'] + 'px';
	}
	if (this.options['left-pos']) {
	    this.cont.style.left = this.options['left-pos'] + 'px';
	}
	this.transformStyleName = PerspectiveTransform.transformStyleName;

	this.world = new Element('div', {
	    'class': 'world'
	});
	this.cont.adopt(this.world);
	this.globe = new Element('div', {
	    'class': 'world-globe'
	});
	this.world.adopt(this.globe);
	this.globeContainer = new Element('div', {
	    'class': 'world-globe-doms-container'
	});
	this.globe.adopt(this.globeContainer);

	this.globePole = new Element('div', {
	    'class': 'world-globe-pole'
	});
	//this.globe.adopt(this.globePole);

	this.globeHalo = new Element('div', {
	    'class': 'world-globe-halo'
	});
	this.globeHalo.style.backgroundImage = 'url(' + CONFIG.root_url + this.options.halo + ')';
	this.globeHalo.style.height = (((this.options.size * 1)) * 2.65) + 'px';;
	this.globeHalo.style.width = (((this.options.size * 1)) * 2.65) + 'px';
	this.globe.adopt(this.globeHalo);

	var loop = function () {
	    this.render();
	}.bind(this);
	//loop.periodical(60);

//	this.world.ondragstart = function () {
//	    return false;
//	};
//	this.world.addEventListener('mousedown', onMouseDown);
//	this.world.addEventListener('mousemove', onMouseMove);
//	this.world.addEventListener('mouseup', onMouseUp);
//	this.world.addEventListener('touchstart', touchPass(onMouseDown));
//	this.world.addEventListener('touchmove', touchPass(onMouseMove));

    },
    toElement: function () {
	return this.cont;
    },
    applyBackground: function(elm) {
	if (elm && elm.style) {
	    elm.style.backgroundImage = 'url(' + CONFIG.root_url + this.options.bg + ')';
	}
    },


    regenerateGlobe: function () {
	var dom, domStyle;
	var x, y;
	this.globeDoms = [];
	while (dom = this.globeContainer.firstChild) {
	    this.globeContainer.removeChild(dom);
	}

	var segX = this.options.segX;
	var segY = this.options.segY;
	var diffuseImgBackgroundStyle = 'url(' + CONFIG.root_url + this.options.globe + ')';
	var segWidth = this.options.globe_image_width / segX | 0;
	var segHeight = this.options.globe_image_height / segY | 0;

	this.vertices = [];

	var verticesRow;
	var radius = this.options.size * 1;
	var phiStart = 0;
	var phiLength = Math.PI * 2;

	var thetaStart = 0;

	var thetaLength = Math.PI;

	for (y = 0; y <= segY; y++) {

	    verticesRow = [];

	    for (x = 0; x <= segX; x++) {

		var u = x / segX;
		var v = 0.05 + y / segY * (1 - 0.1);

		var vertex = {
		    x: -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength),
		    y: -radius * Math.cos(thetaStart + v * thetaLength),
		    z: radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength),
		    phi: phiStart + u * phiLength,
		    theta: thetaStart + v * thetaLength
		};
		verticesRow.push(vertex);
	    }
	    this.vertices.push(verticesRow);
	}

	for (y = 0; y < segY; ++y) {
	    for (x = 0; x < segX; ++x) {
		dom = document.createElement('div');
		domStyle = dom.style;
		domStyle.position = 'absolute';
		domStyle.width = segWidth + 'px';
		domStyle.height = segHeight + 'px';
		domStyle.overflow = 'hidden';
		domStyle[PerspectiveTransform.transformOriginStyleName] = '0 0';
		domStyle.backgroundImage = diffuseImgBackgroundStyle;
		dom.perspectiveTransform = new PerspectiveTransform(dom, segWidth, segHeight);
		dom.topLeft = this.vertices[ y ][ x ];
		dom.topRight = this.vertices[ y ][ x + 1];
		dom.bottomLeft = this.vertices[ y + 1 ][ x ];
		dom.bottomRight = this.vertices[ y + 1 ][ x + 1 ];
		domStyle.backgroundPosition = (-segWidth * x) + 'px ' + (-segHeight * y) + 'px';
		this.globeContainer.appendChild(dom);
		this.globeDoms.push(dom);
	    }
	}

    },
    render: function () {

	if (this.options.autoSpin && !this.isMouseDown && !this.isTweening) {
	    this.options.lng = this.clampLng(this.options.lng - 0.05);
	}

	this.rX = this.options.lat / 180 * Math.PI;
	this.rY = (this.clampLng(this.options.lng) - 270) / 180 * Math.PI;

	this.globePole.style.display = this.options.polevis ? 'block' : 'none';
	this.globeHalo.style.display = this.options.halovis ? 'block' : 'none';

	var ratio = Math.pow(this.options.zoom, 1.5);
	this.pixelExpandOffset = 1.5 + (ratio) * -1.25;
	ratio = 1 + ratio * 3;
	this.globe.style[this.transformStyleName] = 'scale3d(' + ratio + ',' + ratio + ',1)';
	ratio = 1 + Math.pow(this.options.zoom, 3) * 0.3;

	this.transformGlobe();
    },

    clamp: function (x, min, max) {
	return x < min ? min : x > max ? max : x;
    },

    clampLng: function (lng) {
	return ((lng + 180) % 360) - 180;
    },

    transformGlobe: function () {

	var dom, perspectiveTransform;
	var x, y, v1, v2, v3, v4, vertex, verticesRow, i, len;
	if (this.tick ^= 1) {
	    this.sinRY = Math.sin(this.rY);
	    this.sinRX = Math.sin(-this.rX);
	    this.sinRZ = Math.sin(this.rZ);
	    this.cosRY = Math.cos(this.rY);
	    this.cosRX = Math.cos(-this.rX);
	    this.cosRZ = Math.cos(this.rZ);

	    var segX = this.options.segX;
	    var segY = this.options.segY;

	    for (y = 0; y <= segY; y++) {
		verticesRow = this.vertices[y];
		for (x = 0; x <= segX; x++) {
		    this.rotate(vertex = verticesRow[x], vertex.x, vertex.y, vertex.z);
		}
	    }

	    for (y = 0; y < segY; y++) {
		for (x = 0; x < segX; x++) {
		    dom = this.globeDoms[x + segX * y];

		    v1 = dom.topLeft;
		    v2 = dom.topRight;
		    v3 = dom.bottomLeft;
		    v4 = dom.bottomRight;

		    this.expand(v1, v2);
		    this.expand(v2, v3);
		    this.expand(v3, v4);
		    this.expand(v4, v1);

		    perspectiveTransform = dom.perspectiveTransform;
		    perspectiveTransform.topLeft.x = v1.tx;
		    perspectiveTransform.topLeft.y = v1.ty;
		    perspectiveTransform.topRight.x = v2.tx;
		    perspectiveTransform.topRight.y = v2.ty;
		    perspectiveTransform.bottomLeft.x = v3.tx;
		    perspectiveTransform.bottomLeft.y = v3.ty;
		    perspectiveTransform.bottomRight.x = v4.tx;
		    perspectiveTransform.bottomRight.y = v4.ty;
		    perspectiveTransform.hasError = perspectiveTransform.checkError();

		    if (!(perspectiveTransform.hasError = perspectiveTransform.checkError())) {
			perspectiveTransform.calc();
		    }
		}
	    }
	} else {
	    for (i = 0, len = this.globeDoms.length; i < len; i++) {
		perspectiveTransform = this.globeDoms[i].perspectiveTransform;
		if (!perspectiveTransform.hasError) {
		    perspectiveTransform.update();
		} else {
		    perspectiveTransform.style[this.transformStyleName] = 'translate3d(-8192px, 0, 0)';
		}
	    }
	}
    },

    goTo: function (lat, lng) {
	var dX = lat - this.options.lat;
	var dY = lng - this.options.lng;
	var roughDistance = Math.sqrt(dX * dX + dY * dY);
	this.isTweening = true;
	this.options.lat = lat;
	this.options.lng = lng;
//	TweenMax.to(this.options, roughDistance * 0.01, {lat: lat, lng: lng, ease: 'easeInOutSine'});
//	TweenMax.to(this.options, 1, {delay: roughDistance * 0.01, zoom: 1, ease: 'easeInOutSine', onComplete: function () {
//		this.isTweening = false;
//	    }.bind(this)});
    },

    rotate: function (vertex, x, y, z) {
	x0 = x * this.cosRY - z * this.sinRY;
	z0 = z * this.cosRY + x * this.sinRY;
	y0 = y * this.cosRX - z0 * this.sinRX;
	z0 = z0 * this.cosRX + y * this.sinRX;

	var offset = 1 + (z0 / 4000);
	x1 = x0 * this.cosRZ - y0 * this.sinRZ;
	y0 = y0 * this.cosRZ + x0 * this.sinRZ;

	vertex.px = x1 * offset;
	vertex.py = y0 * offset;
    },

// shameless stole and edited from threejs CanvasRenderer
    expand: function (v1, v2) {

	var x = v2.px - v1.px, y = v2.py - v1.py,
		det = x * x + y * y, idet;

	if (det === 0) {
	    v1.tx = v1.px;
	    v1.ty = v1.py;
	    v2.tx = v2.px;
	    v2.ty = v2.py;
	    return;
	}

	idet = this.pixelExpandOffset / Math.sqrt(det);

	x *= idet;
	y *= idet;

	v2.tx = v2.px + x;
	v2.ty = v2.py + y;
	v1.tx = v1.px - x;
	v1.ty = v1.py - y;

    }


});