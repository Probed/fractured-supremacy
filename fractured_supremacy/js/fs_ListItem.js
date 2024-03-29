var fs_ListItem = new Class({
    Implements: [Options],
    _listButton: null,
    _listLink: null,
    _listItem: null,
    options: {
	title: 'Unknown',
    },
    initialize: function (options) {
	this.setOptions(options);
    },
    asButton: function (list) {
	return this._listButton = new Element('div', {
	    'class' : 'fs_ListItem button',
	    'html': '<span>' + this.options.title + '</span>',
	    'events': {
		'click': function (e) {
		    this.options.click && this.options.click(e);
		    e && e.stopPropagation && e.stopPropagation();
		}.bind(this)
	    }
	}).adopt(this.options.body);
    },
    asListItem: function (list) {
	return this._listItem = new Element('div', {
	    'class' : 'fs_ListItem list',
	    'html': this.options.title,
	    'events': {
		'click': function (e) {
		    this.options.click && this.options.click(e);
		    e && e.stopPropagation && e.stopPropagation();
		}.bind(this)
	    }
	});
    },
    asLink: function (list) {
	return this._listLink = new Element('div', {
	    'class' : 'fs_ListItem link',
	    'html': this.options.title,
	    'events': {
		'click': function (e) {
		    this.options.click && this.options.click(e);
		    e && e.stopPropagation && e.stopPropagation();
		}.bind(this)
	    }
	});
    }
});