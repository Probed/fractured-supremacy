var fs_Cube_Count = 0;
var fs_Cube = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {
	cube: 'cube-' + (fs_Cube_Count),
	"top-pos": 0,
	"left-pos": 0,
	size: 0,
	top: null,
	bottom: null,
	left: null,
	right: null,
	front: null,
	back: null,
	rotateX: 45,
	rotateY: -45
    },
    initialize: function (options) {
	this.setOptions(options);
	fs_Cube_Count++;

	this.cont = new Element('div', {
	    'class': 'fs_Cube ' + this.options.cube,
	    style: "height:" + this.options.size + "px;width:" + this.options.size + "px;top:" + this.options["top-pos"] + "px;left:" + this.options["left-pos"] + "px;"
	});

	this.options.back && this.cont.adopt((this.back = new fs_Panel({
	    'panel': this.options.cube + '-back',
	    image: this.options.back,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.options.front && this.cont.adopt((this.front = new fs_Panel({
	    'panel': this.options.cube + '-front',
	    image: this.options.front,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.options.top && this.cont.adopt((this.top = new fs_Panel({
	    'panel': this.options.cube + '-top',
	    image: this.options.top,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.options.bottom && this.cont.adopt((this.bottom = new fs_Panel({
	    'panel': this.options.cube + '-bottom',
	    image: this.options.bottom,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.options.left && this.cont.adopt((this.left = new fs_Panel({
	    'panel': this.options.cube + '-left',
	    image: this.options.left,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.options.right && this.cont.adopt((this.right = new fs_Panel({
	    'panel': this.options.cube + '-right',
	    image: this.options.right,
	    height: this.options.size,
	    width: this.options.size
	})).toElement());

	this.refresh();

    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {
	this.rotateTo(this.options.rotateX, this.options.rotateY);
    },
    rotateTo: function (x, y) {
	x = x * 1;
	y = y * 1;
	this.back && this.back.rotateTo(y, x + 90, 0);
	this.front && this.front.rotateTo(y, x + 270, 0);
	this.top && this.top.rotateTo(y + 90, 0, -x);
	this.bottom && this.bottom.rotateTo(y - 90, 0, x);
	this.left && this.left.rotateTo(y, x + 180, 0);
	this.right && this.right.rotateTo(y, x, 0);
    }
});