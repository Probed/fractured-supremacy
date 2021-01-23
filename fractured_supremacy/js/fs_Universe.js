var fs_Universe = new Class({
    Implements: [Events, Options],
    cont: Class.empty,

    options: {

    },
    initialize: function (universe, owner) {
	this.universe = universe;
	this.owner = owner;

	//primary container div to be added to the dom
	this.cont = new Element('div', {
	    'class': 'fs_Universe'
	});

	Object.each(this.universe.celestial_objects, function (co, id) {
	    co["object"] = new fs_Celestial_Object(co, this);
	}.bind(this));
    },

    toElement: function () {
	return this.cont;
    },

    /**
     * Activate this celestial object
     */
    activate : function() {
	this.toElement().addClass('active');
	Object.each(this.universe.celestial_objects, function (co, id) {
	    if (co["object"].options.options.active){
		co["object"].activate();
	    }
	}.bind(this));
    },

    /**
     * Deactivate this celestial object
     */
    deactivate : function() {
	this.toElement().removeClass('active');
    },

    /**
     * Calls loadContainer on all child objects
     *
     * @returns null
     */
    loadContainers: function () {
	Object.each(this.universe.celestial_objects, function (co, id) {
	    this.cont.adopt(co["object"].loadContainers());
	}.bind(this));
	return this.cont;
    },

    activate_celestial_object: function () {

    }
});