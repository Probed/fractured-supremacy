var fs_BottomBar = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    _botLeft: null,
    _botRight: null,
    _botMid: null,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'bot'
	});

	this.cont.adopt(this._botLeft = new Element('div', {
	    "class": "bottom-left"
	}));
	this.cont.adopt(this._botMid = new Element('div', {
	    "class": "bottom-mid"
	}));
	this.cont.adopt(this._botRight = new Element('div', {
	    "class": "bottom-right"
	}));
    },
    toElement: function () {
	return this.cont;
    }
});