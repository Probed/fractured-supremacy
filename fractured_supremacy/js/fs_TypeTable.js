/*
 * fs_TypeTable
 *
 * This is the parent class for all database tabels that have a Type table
 * It extends the fs_ListItem class for easy listing with the fs_List class
 *
 * @type Class
 */
/* global TYPES */

var fs_TypeTable = new Class({
    Implements: [Events, Options, fs_ListItem],
    table: null, /* must set in child class. should be set to the name of the table ie: building */
    table_type: null, /* must set in child class. should be set to the name of the type table ie: building_type */
    type: null, /* Holds the contents of the table_type as loaded from the DB */
    options: {

    },
    initialize: function (options) {
	this.setOptions(options);
	/*
	 * Set type to the global var types for this table_type. ie: building_type (name,cat,desc,options,etc)
	 */
	if (typeof TYPES != 'undefined') {
	    this.type = TYPES[this.table][options[this.table_type + '_id']];
	}
	/*
	 * take this objects options and merge them with the default type options
	 */
	this.applyOptions(options);
	/*
	 * Create the DOM object that will hold the games play area container
	 */
	this.cont = new Element('div', {
	    "class": this.getClass(),
	    "events": {
		"click": function (e) {
		    this.activate();
		    e && e.preventDefault && e.preventDefault();
		    e && e.stopPropagation && e.stopPropagation();
		    return false;
		}.bind(this)
	    }
	});
    },
    /*
     * Return the Game container element
     * @returns {Element}
     */
    toElement: function () {
	return this.cont;
    },
    /*
     * merge the type options and apply level overrides
     */
    applyOptions: function (obj) {
	if (!this.type) {
	    return
	}
	obj["options"] = Object.merge({}, this.type.options, obj.options);
	this.setOptions(obj);
	this.cont && this.cont.setProperty("class", this.getClass());
    },
    getClass: function () {
	var c = this.table;
	var css = getOption(this.options, 'styles', 'css', 'css');
	if (css) {
	    c += " type-" + css["css"];
	}
	c += " level-" + (this.options.level || 1);
	return c;
    },
    getModel: function (modelOpts = {}) {
	return new fs_Model(this.options, modelOpts);
    }
});