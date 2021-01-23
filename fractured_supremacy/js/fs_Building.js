var fs_Building = new Class({
    Extends: fs_TypeTable,
    table: 'building',
    table_type: 'building_type',
    options: {
	name: 'Unknown Building',
	type: 'Unknown',
	category: 'Unknown',
	subcat: 'Unknown',
	short_desc: '',
	long_desc: '',
	options: {},
	object: null, //holds 'this'
	//BuildingInhabitants: [], //holds a list of fs_BuildingInhabitants instances
    },
    initialize: function (building, platform) {
	this.parent(building);
	this.platform = platform;

//	this.building = building;
//	Object.each(this.building["buildings"],function (building, id) {
//	    building["object"] = new fs_Building({}, building);
//	    this.cont.adopt(building["object"].toElement());
//	}.bind(this));

	this.model = new fs_Model(building);
	this.cont.adopt(this.model);

    },

    /**
     * Calls loadContainer on all child objects
     *
     * @returns null
     */
    loadContainers :function() {
//	Object.each(this.options["buildings"], function (building, id) {
//	    this.cont.adopt(building["object"].loadContainers());
//	}.bind(this));
	return this.cont;
    },
});