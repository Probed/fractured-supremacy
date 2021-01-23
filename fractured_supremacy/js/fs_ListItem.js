var fs_ListItem = new Class({
    _listButton: null,
    _listLink: null,
    _listItem: null,
    asButton: function () {
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
    asListItem: function () {
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
    asLink: function () {
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