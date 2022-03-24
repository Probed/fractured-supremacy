var fs_List = new Class({
    Implements: [Events, Options],
    cont: null,
    _listItems: [],
    options: {
	as: null,
	list: Class.empty
    },
    initialize: function (options) {
	this.setOptions(options);
	this.cont = new Element('div', {
	    'class': 'fs_List ' + (this.options["class"] || "")
	});
    },
    _addListItem: function (listitem) {
	var li = null;
	switch (this.options.as) {
	    case 'button':
		li = listitem.asButton(this);
		break;
	    case 'link':
		li = listitem.asLink(this);
		break;
	    default:
		li = listitem.asListItem(this);
		break;
	}
	this.cont.adopt(li);
	return this;
    },
    addListItem: function (listitem) {
	return this._addListItem(listitem);
    },
    toElement: function () {
	return this.cont;
    }

});