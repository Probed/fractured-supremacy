var fs_LeftBar = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'left'
	});

	this.cont.adopt(this._leftTop = new Element('div', {
	    "class": "left-top"
	}));
	this.cont.adopt(this._leftMid = new Element('div', {
	    "class": "left-mid"
	}));
	this.cont.adopt(this._leftBot = new Element('div', {
	    "class": "left-bot"
	}));
    },
    toElement: function () {
	return this.cont;
    }
});