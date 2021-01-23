var fs_Time = new Class({
    Implements: [Events, Options],
    cont: null,

    options: {
	icon: false,
	iconPos: 'before',
	ms: 0,

    },
    initialize: function (options) {
	this.options = options
	this.cont = new Element('span', {
	    'class': 'fs_Time'
	});
	if (this.options["class"]) {
	    this.cont.addClass(this.options["class"]);
	}
	this.refresh();
    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {

	var html = '';
	var icon = '';
	if (typeOf(this.options.icon) == 'boolean' && this.options.icon) {
	    icon = fs_Icon('clock');
	}
	if (typeOf(this.options.icon) == 'string') {
	    icon = fs_Icon(this.options.icon);
	}
	if (this.options.icon && this.options.iconPos == 'before') {
	    html += icon;
	}
	html += this.buildTimeString();
	if (this.options.icon && this.options.iconPos == 'after') {
	    html += icon;
	}
	this.cont.html = html;
    },
    buildTimeString: function () {
	var time = '';
	if (this.options.ms) {
	    time = (this.options.ms / 1000) +'s'
	}
	return time;
    },
    toString: function () {
	return this.buildTimeString();
    }

});