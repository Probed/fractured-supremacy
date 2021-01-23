var fs_Cylinder = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {
	"height": 50,
	"width": 10,
	"outerColor": "blue",
	"innerColor": "white",
	"top-pos": 0,
	"left-pos": 0
    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'fs_Cylinder ' + this.options.cylinder,
	    style: "height:" + this.options.height + "px;"
		    + "width:" + this.options.width + "px;"
		    + "top:" + this.options["top-pos"] + "px;"
		    + "left:" + this.options["left-pos"] + "px;"
		    + "border-radius:" + this.options.width + "px/" + (this.options.width / 2) + "px;"
		    + "background-color:" + this.options.outerColor + "px;"
	});
	this.cont.adopt(this.water = new Element('div', {
	    'class': 'water',
	    style: "width:" + this.options.width + "px;"
//		    + "height:" + (this.options.height/2) + "px;"
		    + "padding-top:" + (this.options.width/2) + "px;"
		    + "border-radius:" + this.options.width + "px/" + (this.options.width / 2) + "px;"
		    + "background-color:" + this.options.innerColor + ";"
	}));

	addRule('.fs_Cylinder.' + this.options.cylinder + ":before", {
	    width: this.options.width + 'px',
	    height: this.options.height + 'px',
	    'border-radius': this.options.width + "px/" + (this.options.width / 2) + "px",
	    'background-color': this.options.outerColor
	});

	addRule('.fs_Cylinder.' + this.options.cylinder + ":after", {
	    width: this.options.width + 'px',
	    height: this.options.height + 'px',
	    'border-radius': this.options.width + "px/" + (this.options.width / 2) + "px",
	    'background-color': this.options.outerColor
	});

	addRule('.fs_Cylinder.' + this.options.cylinder + " .water:before", {
	    width: this.options.width + 'px',
	    height: '0px',
	    'border-radius': this.options.width + "px/" + (this.options.width / 2) + "px",
	    'background-color': this.options.innerColor
	});

	addRule('.fs_Cylinder.' + this.options.cylinder + " .water:after", {
	    width: this.options.width + 'px',
	    height: '0px',
	    'border-radius': this.options.width + "px/" + (this.options.width / 2) + "px",
	    'background-color': this.options.innerColor
	});

    },
    toElement: function () {
	return this.cont;
    }
});