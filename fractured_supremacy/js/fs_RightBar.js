var fs_RightBar = new Class({
    Implements: [Events, Options],
    cont: Class.empty,
    _rightTop: null,
    _rightMid: null,
    _rightBot: null,
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);

	this.cont = new Element('div', {
	    'class': 'right'
	});

	this.cont.adopt(this._rightTop = new Element('div', {
	    "class": "right-top"
	}));
	this.cont.adopt(this._rightMid = new Element('div', {
	    "class": "right-mid"
	}));
	this.cont.adopt(this._rightBot = new Element('div', {
	    "class": "right-bot"
	}));
    },
    toElement: function () {
	return this.cont;
    }
});