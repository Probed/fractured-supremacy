var fs_Platform = new Class({
    Extends: fs_TypeTable,
    table: 'platform',
    table_type: 'platform_type',
    satellite: null,
    buildings: [],
    platformMounts: null, /* array of mount points for other platforms */
    options: {
	name: 'Unknown Platform',
	type: 'Unknown',
	category: 'Unknown',
	subcat: 'Unknown',
	short_desc: '',
	long_desc: '',
	options: {},
	object: null, //holds 'this'
	buildings: [], //holds a list of fs_Building instances
    },
    initialize: function (platform, satellite) {
	this.parent(platform);

	this.satellite = satellite; // the parent fs_Satellie

	this.createBuildingMountPoints();

	Object.each(this.options["buildings"], function (building, id) {
	    building["object"] = new fs_Building(building, this);
	}.bind(this));

	this.cont.style.height = this.satellite.platformSize + 'px';
	this.cont.style.width = this.satellite.platformSize + 'px';
	this.cont.setAttribute('data-buildings', Object.keys(this.options["buildings"]).length);

	var bg = getOption(this.options, "model", "image", "bg");
	this.cont.style.backgroundImage = 'url(' + CONFIG["root_url"] + bg["value"] + ')';
    },

    /**
     * Calls loadContainer on all child objects
     *
     * @returns null
     */
    loadContainers :function() {
	Object.each(this.options["buildings"], function (building, id) {
	    building["object"].loadContainers()
	    this.mountBuilding(building);
	}.bind(this));
	return this.cont;
    },

    createBuildingMountPoints: function () {
	this.buildingMounts = {};
	if (!this.options.options.mounts) {
	    return;
	}
	Object.each(this.options.options.mounts, function (mount, id) {
	    var mountelm = new Element('div', {
		"class": "empty building-mount",
		"events": {
		    "click": function (e) {
			if (mountelm.hasClass('empty')) {
			    this.addBuilding(mount["mount"]);
			}
			e && e.stopPropagation && e.stopPropagation();
		    }.bind(this)
		}
	    });
	    setMountPosition(mountelm,mount.position)
	    this.buildingMounts[mount.mount] = mountelm;
	    this.cont.adopt(mountelm);
	}.bind(this));
    },
    mountBuilding: function (building) {
	if (!building || !building.options || !building.options.mount || !this.buildingMounts[building.options.mount]) {
	    return;
	}
	this.buildingMounts[building.options.mount].removeClass('empty');
	this.buildingMounts[building.options.mount].adopt(building.object.toElement());
    },
    upgrade: function () {
	this.options.options.level++;
	this.applyOptions(this.options);
	this.satellite.mountPlatforms();
    },

    addBuilding: function (mountName) {
	var list = new fs_List({
	    as: "button"
	});
	Object.each(TYPES["building"], function (ptype, id) {
	    if (ptype.type == 'HQ') {
		return;
	    }
	    list.addListItem(new fs_ListItem({
		title: ptype.name,
		body: new fs_Building({building_type_id: id}, this).toElement(),
		click: function (e) {

		    var building = {
			id: 999,
			platform_id: this.platform.id,
			building_type_id: id,
			options: {
			    buildingMounts: {
				mountName: 999
			    }
			}
		    };
		    building["object"] = new fs_Building(building, this);
		    this.satellite.satellite.platforms[this.platform.id]["buildings"][building.id] = building;
		    this.buildingMounts[mountName].adopt(building["object"].toElement());
		    this.buildingMounts[mountName].removeClass('empty');
		    this.options.buildingMounts = this.satellite.satellite.platforms[this.platform.id]["options"]["buildingMounts"] = Object.merge({id: 999}, this.options.buildingMounts);
		    this.satellite.mountPlatforms();
		    win.close();
//		    app.submit({
//			action: 'addPlatform',
//			data: {
//			    sat_id: this.satellite.satellite.id,
//			    plat_id: this.platform.id,
//			    mount: mountName,
//			    plat_type_id: id
//			},
//			onSuccess: function (response) {
//			    var plat = response.platform[0];
//			    plat["object"] = new fs_Platform(plat, this.satellite);
//			    this.satellite.satellite.platforms[plat["id"]] = plat;
//			    this.satellite.cont.adopt(plat["object"].toElement());
//			    this.options.platformMounts = this.satellite.satellite.platforms[this.platform.id]["options"]["platformMounts"] = Object.merge(response.mounts, this.options.platformMounts);
//			    this.satellite.mountPlatforms();
//			    win.close();
//			}.bind(this)
//		    });
		}.bind(this)
	    }));
	}.bind(this));
	var win = new fs_Window({
	    'class': 'add add-building',
	    canClose: true,
	    title: "Build New Building",
	    body: list.toElement()
	}).open();
    }
});