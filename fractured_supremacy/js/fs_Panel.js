var fs_Panel_Count = 0;
var fs_Panel = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {
	panel: 'panel-' + (fs_Panel_Count),
	height: 0,
	image: null,
	width: 0,
	'top-pos': 0,
	'left-pos': 0,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0
    },
    initialize: function (options) {
	this.setOptions(options);
	fs_Panel_Count++;
	this.cont = new Element('div', {
	    'class': 'fs_Panel ' + this.options.panel
	});
	this.refresh();
    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {
	this.cont.style.backgroundImage = "url('" + CONFIG["root_url"] + this.options.image + "')";
	this.cont.style.height = this.options.height + "px";
	this.cont.style.width = this.options.width + "px";
	this.cont.style.top = this.options["top-pos"] + "px";
	this.cont.style.left = this.options["left-pos"] + "px";
	this.rotateTo(this.options.rotateX, this.options.rotateY, this.options.rotateZ);
	this.cont.style.transformOrigin = "50% 50% " + (this.options["height"] / -2) + "px";
    },
    rotateTo: function (x, y, z) {
	this.cont.style.transform = `rotateX(${x * 1}deg) rotateY(${y * 1}deg) rotateZ(${z * 1}deg)`;
	this.options.rotateY = y;
	this.options.rotateX = x;
	this.options.rotateZ = z;
    }
});