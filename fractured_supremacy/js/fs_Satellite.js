var fs_Satellite = new Class({
    Extends: fs_TypeTable,
    table: 'satellite',
    table_type: 'satellite_type',
    platformSize: null,
    dragging: false,
    options: {
	name: 'Unknown Satellite',
	type: 'Unknown',
	category: 'Unknown',
	subcat: 'Unknown',
	short_desc: '',
	long_desc: '',
	options: {},
	object: null, //holds 'this'
	platforms: [], //holds a list of fs_Platform instances
    },
    initialize: function (satellite, celestial_object) {
	this.parent(satellite);
	this.celestial_object = celestial_object; //the parent celestial object

	var size = getOption(this.options, "model", "var", "platformSize");
	this.platformSize = size["val"];

	this.layout = getOption(this.options, "model", "layout", "value");
	this.layout = this.layout["value"];

	this.cont.style.height = ((this.layout[0].length) * this.platformSize) + 'px';
	this.cont.style.width = ((this.layout.length) * this.platformSize) + 'px';

	Object.each(this.options["platforms"], function (plat, id) {
	    plat["object"] = new fs_Platform(plat, this);
	}.bind(this));

	this.drag = new Drag.Move(this.cont, {
	    onStart: function (el) {
		this.dragging = true;
	    }.bind(this),
	    onComplete: function (el) {
		this.dragging = false;
	    }.bind(this),
	    onCancel: function (el) {
		this.dragging = false;
	    }.bind(this)
	});

    },
    /**
     * Calls loadContainer on all child objects
     * @returns null
     */
    loadContainers :function() {
	Object.each(this.options["platforms"], function (plat, id) {
	    this.cont.adopt(plat["object"].loadContainers());
	}.bind(this));
	this.mountPlatforms();
	return this.cont;
    },
    mountPlatforms: function () {
	var grid = [];
	//create the layout grid

	Object.each(this.layout, function (row, y) {
	    y = y * 1;
	    grid[y] = [];
	    Object.each(row, function (col, x) {
		x = x * 1;
		grid[y][x] = {
		    allowed: col
		};
	    }.bind(this));
	}.bind(this));

	//place all platforms down
	Object.each(grid, function (row, y) {
	    y = y * 1;
	    Object.each(row, function (col, x) {
		x = x * 1;
		var p = this.getPlatformByPos(x, y);
		if (p) {
		    var area = this.addPlatformArea(y, x, grid);
		    if (area) {
			grid[y][x].platform = p;
			area.adopt(p);
			area.removeClass('empty');
			area.removeEvents('click');
		    }
		}
	    }.bind(this));
	}.bind(this));

	//add surrounding buildable spots
	Object.each(grid, function (row, y) {
	    y = y * 1;
	    Object.each(row, function (col, x) {
		x = x * 1;
		if (col.platform) {
		    this.addPlatformArea(y, x - 1, grid);
		    this.addPlatformArea(y, x + 1, grid);
		    this.addPlatformArea(y - 1, x, grid);
		    this.addPlatformArea(y + 1, x, grid);
		}
	    }.bind(this));
	}.bind(this));

    },
    addPlatformArea: function (y, x, grid) {
	var t = this;
	if (!grid[y]) {
	    return;
	}
	if (!grid[y][x]) {
	    return;
	}
	var cell = grid[y][x];

	if (cell.platform || cell.area) {
	    return;
	}
	var area;
	switch (cell.allowed) {
	    case "p":
		area = new Element('div', {
		    "class": "platform-area empty area-" + cell.allowed,
		    "p-x": x,
		    "p-y": y
		});
		this.cont.adopt(area);
		break;
	    case "s":
		area = new Element('div', {
		    "class": "platform-area empty area-" + cell.allowed,
		    "p-x": x,
		    "p-y": y
		});
		this.cont.adopt(area);
		break;
	    case "h":
		area = new Element('div', {
		    "class": "platform-area empty area-" + cell.allowed,
		    "p-x": x,
		    "p-y": y
		});
		this.cont.adopt(area);
		break;

	    case "d":
		area = new Element('div', {
		    "class": "platform-area empty area-" + cell.allowed,
		    "p-x": x,
		    "p-y": y
		});
		this.cont.adopt(area);
		break;

	    default:
		//empty
		break;
	}
	grid[y][x].area = area;
	if (area) {
	    area.style.height = (this.platformSize) + 'px';
	    area.style.width = (this.platformSize) + 'px'
	    area.style.top = (this.platformSize * x) + 'px'
	    area.style.left = (this.platformSize * y) + 'px'
	    area.addEvent('click', function (e) {
		t.addPlatform(y, x);
		e.stopPropagation();
	    }.bind(this));
	}

	return area;
    },
    addPlatform: function (y, x) {
	var list = new fs_List({
	    as: "button"
	});
	Object.each(TYPES["platform"], function (ptype, id) {
	    if (ptype.type == 'Hub') {
		return;
	    }
	    list.addListItem(new fs_ListItem({
		title: ptype.name,
		body: new Element('div', {
		    'class': 'platform '
		}),
		click: function (e) {
		    app.submit({
			action: 'addPlatform',
			data: {
			    sat_id: this.satellite.id,
			    plat_type_id: ptype.id,
			    x: x,
			    y: y
			},
			onSuccess: function (response) {
			    var plat = response.platform[0];
			    plat["object"] = new fs_Platform(plat, this);
			    this.satellite.platforms[plat["id"]] = plat;
			    this.cont.adopt(plat["object"].toElement());
			    win.close();
			    this.activate();
			}.bind(this)
		    });
		}.bind(this)
	    }));
	}.bind(this));
	var win = new fs_Window({
	    'class': 'add add-platform',
	    canClose: true,
	    title: "Build New Platform",
	    body: list.toElement()
	}).open();
    },
    getPlatformByPos: function (x, y) {
	var platform = null;
	Object.each(this.options["platforms"], function (plat, id) {
	    if (platform) {
		return;
	    }
	    if (plat.options.platformPosition.x * 1 === x * 1 && plat.options.platformPosition.y * 1 === y * 1) {
		platform = plat["object"];
	    }
	}.bind(this));
	return platform;
    }
});