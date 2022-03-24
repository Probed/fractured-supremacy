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
	var ms = this.options.ms;
	var second = 1000;
	var minute = second * 60;
	var hour = minute * 60;
	var day = hour * 24;

	var days = Math.floor(this.options.ms / day);
	if (days >= 1) {
	    ms = ms - (days * day);
	}
	var hours = Math.floor(ms / hour);
	if (hours >= 1) {
	    ms = ms - (hours * hour);
	}
	var minutes = Math.floor(ms / minute);
	if (minutes >= 1) {
	    ms = ms - (minutes * minute);
	}
	var seconds = Math.floor(ms / second);
	if (seconds >= 1) {
	    ms = ms - (seconds * second);
	}

	if (this.options.ms) {
	    if (days >= 1) {
		time += days + 'd ';
	    }
	    if (hours >= 1) {
		time += hours + 'h ';
	    }
	    if (minutes >= 1) {
		time += minutes + 'm ';
	    }
	    if (seconds >= 1) {
		time += seconds + 's';
	    }
	}
	return time;
    },
    toString: function () {
	return this.buildTimeString();
    }

});