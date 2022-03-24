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
    loadContainers: function () {
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
		class: "empty building-mount",
		html: '',
		events: {
		    click: function (e) {
			if (mountelm.hasClass('empty')) {
			    this.addBuilding(mount["mount"]);
			}
			e && e.stopPropagation && e.stopPropagation();
		    }.bind(this)
		}
	    });
	    setMountPosition(mountelm, mount.position)
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

	var buildings = {};
	each(upTypes["building"], function (typeIds, sc) {
	    each(typeIds, function (arr) {
		buildings[arr[0]] = TYPES["building"][arr[0]];
	    });
	});
	var keys = Object.keys(buildings);
	keys.sort(function (a, b) {
	    var namea = buildings[a]["name"];
	    var nameb = buildings[b]["name"]
	    return namea < nameb ? -1 : (namea > nameb ? 1 : 0);
	});

	var tabs = new fs_Tabs();
	each(["Basic", "Intermediate", "Advanced", "Revolutionary", "Special"], function (type, index) {
	    var list = new fs_List({
		as: "button"
	    });
	    Object.each(keys, function (id) {
		var building_type = TYPES["building"][id];
		if (building_type.type != type) {
		    return;
		}
		list.addListItem(new fs_ListItem({
		    title: building_type.name.replace('Level 1', ''),
		    body: new fs_Building({building_type_id: id}).getModel(),
		    click: function (e) {
			app.submit({
			    action: 'addBuilding',
			    data: {
				plat_id: this.options.id,
				mount: mountName,
				building_type_id: id
			    },
			    onSuccess: function (response) {
				var building = response.building;
				building["object"] = new fs_Building(building, this);
				this.satellite.options.platforms[this.options.id]["buildings"][building.id] = building;
				this.buildingMounts[mountName].adopt(building["object"].toElement());
				this.buildingMounts[mountName].removeClass('empty');
				this.satellite.mountPlatforms();
				win.close();
			    }.bind(this)
			});
		    }.bind(this)
		}));
	    }.bind(this));
	    tabs.add({label: type}, list);
	}.bind(this));
	var win = new fs_Window({
	    class: 'add add-building',
	    canClose: true,
	    title: "Build New Building",
	    body: tabs.toElement(),
	    buttons: [
		(cancelButton({}, function () {
		    win.close();
		}))
	    ]
	}).open();

	tabs.activate(0);
    }
});