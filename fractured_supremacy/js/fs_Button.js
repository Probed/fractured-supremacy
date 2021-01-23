var fs_Button = new Class({
    Implements: [Options],
    cont: Class.empty,
    options: {
	type: 'div',
	icon: null,
	iconPos: 'before'
    },
    initialize: function (options) {
	this.setOptions(options);
	this.cont = new Element(this.options.type, this.options);
	this.refresh();
    },
    toElement: function () {
	return this.cont;
    },
    refresh: function () {
	this.cont.empty();

	this.cont.addClass('fs_Button');
	if (this.options.icon) {
	    this.cont.addClass(this.options.icon);
	}
	var html = '';

	if (this.options.icon && this.options.iconPos == "before") {
	    html = fs_Icon(this.options.icon);
	    if (this.options.html) {
		html += ' ';
	    }
	}
	if (this.options.html) {
	    html += this.options.html;
	}
	if (this.options.icon && this.options.iconPos == "after") {
	    if (this.options.html) {
		html += ' ';
	    }
	    html += fs_Icon(this.options.icon);
	}
	if (html) {
	    this.cont.set('html', html);
	}
    }
});