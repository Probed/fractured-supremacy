var fs_Celestial_Object = new Class({
    Extends: fs_TypeTable,
    table: 'celestial_object', //the name of the table when performing universe lookups
    table_type: 'celestial_object_type', //the name of the table that holds all the different types of celetial objects
    options: {
	name: 'Unknown Celestial Object',
	type: 'Unknown',
	category: 'Unknown',
	subcat: 'Unknown',
	short_desc: '',
	long_desc: '',
	options: {},
	object: null, //holds 'this'
	satellites: [], //holds a list of json satteilte instances
    },

    /**
     * Initialize the celestial object, and initialize all child satellites
     *
     * @param {json} celestial_object
     * @param {fs_Universe} universe
     * @returns {undefined}
     */
    initialize: function (celestial_object, universe) {
	this.parent(celestial_object);
	this.universe = universe; // the fs_Universe object this celestial object belongs to

	//Initalize all child satellites
	Object.each(this.options["satellites"], function (sat, id) {
	    sat["object"] = new fs_Satellite(sat, this);
	}.bind(this));

    },

    /**
     * Calls loadContainer on all child objects
     *
     * @returns this.cont
     */
    loadContainers: function () {
	this.cont.adopt(this.gameModel());
	Object.each(this.options["satellites"], function (sat, id) {
	    var satellite = sat["object"].loadContainers();
	    this.cont.adopt(satellite);
	}.bind(this));
	return this.cont;
    },

    /**
     * Activate this celestial object
     */
    activate: function () {
	this.options.options.active = true;
	this.toElement().addClass('active');
	this.applyModelBg();
    },

    /**
     * Deactivate this celestial object
     */
    deactivate: function () {
	this.toElement().removeClass('active');
	this.options.options.active = false;
    },

    /**
     * Default Game Model
     * @returns fs_Model
     */
    gameModel: function () {
	return this.model || (this.model = this.getModel({
	    size: 600,
	    segX: 24,
	    segY: 12
	}));
    },

    /**
     * Finds the sphere object in the model and retrieves the 'bg' value and sets the background of the main wapper container (this.cont)
     * @returns null
     */
    applyModelBg: function () {
	this.model && this.model.modelElms.each(function (item, index) {
	    if (typeOf(item.applyBackground) == 'function') {
		item.applyBackground(this.cont);
	    }
	}.bind(this));
    }
});